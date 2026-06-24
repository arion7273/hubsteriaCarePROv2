import type { AuditEvent, AuthSession, Facility, MfaChallenge, OperationalRecord, Organization, PasswordResetRequest, RegisteredFeature, Resident, User, UUID } from '../../domain';
import type { SqlStatement } from './types';

export const organizationStatements = {
  selectById(id: UUID): SqlStatement {
    return {
      text: 'SELECT id, name, status FROM organizations WHERE id = $1',
      values: [id]
    };
  },

  list(): SqlStatement {
    return {
      text: 'SELECT id, name, status FROM organizations ORDER BY name',
      values: []
    };
  },

  upsert(organization: Organization): SqlStatement {
    return {
      text: `
        INSERT INTO organizations (id, name, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            status = EXCLUDED.status,
            updated_at = now()
        RETURNING id, name, status
      `,
      values: [organization.id, organization.name, organization.status]
    };
  }
};

export const facilityStatements = {
  selectById(id: UUID): SqlStatement {
    return {
      text: 'SELECT id, organization_id, name, status FROM facilities WHERE id = $1',
      values: [id]
    };
  },

  listByOrganization(organizationId: UUID): SqlStatement {
    return {
      text: `
        SELECT id, organization_id, name, status
        FROM facilities
        WHERE organization_id = $1
        ORDER BY name
      `,
      values: [organizationId]
    };
  },

  upsert(facility: Facility): SqlStatement {
    return {
      text: `
        INSERT INTO facilities (id, organization_id, name, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE
        SET organization_id = EXCLUDED.organization_id,
            name = EXCLUDED.name,
            status = EXCLUDED.status,
            updated_at = now()
        RETURNING id, organization_id, name, status
      `,
      values: [facility.id, facility.organizationId, facility.name, facility.status]
    };
  }
};

export const userStatements = {
  selectById(id: UUID): SqlStatement {
    return selectUser('u.id = $1', [id]);
  },

  selectByEmail(email: string): SqlStatement {
    return selectUser('u.email = $1', [email]);
  },

  listByOrganization(organizationId: UUID): SqlStatement {
    return selectUser('u.organization_id = $1', [organizationId], 'ORDER BY u.email');
  },

  upsert(user: User, roleId: UUID): SqlStatement {
    return {
      text: `
        INSERT INTO users (id, organization_id, primary_facility_id, email, role_id, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE
        SET organization_id = EXCLUDED.organization_id,
            primary_facility_id = EXCLUDED.primary_facility_id,
            email = EXCLUDED.email,
            role_id = EXCLUDED.role_id,
            status = EXCLUDED.status,
            updated_at = now()
        RETURNING id
      `,
      values: [user.id, user.organizationId ?? null, user.facilityIds[0] ?? null, user.email, roleId, user.status]
    };
  },

  deleteFacilities(userId: UUID): SqlStatement {
    return {
      text: 'DELETE FROM user_facilities WHERE user_id = $1',
      values: [userId]
    };
  },

  insertFacility(userId: UUID, facilityId: UUID): SqlStatement {
    return {
      text: `
        INSERT INTO user_facilities (user_id, facility_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, facility_id) DO NOTHING
      `,
      values: [userId, facilityId]
    };
  }
};

export const residentStatements = {
  selectById(id: UUID): SqlStatement {
    return {
      text: `
        SELECT id, organization_id, facility_id, preferred_name, first_name, last_name, room, level_of_care, status
        FROM residents
        WHERE id = $1
      `,
      values: [id]
    };
  },

  listByFacility(organizationId: UUID, facilityId: UUID): SqlStatement {
    return {
      text: `
        SELECT id, organization_id, facility_id, preferred_name, first_name, last_name, room, level_of_care, status
        FROM residents
        WHERE organization_id = $1
          AND facility_id = $2
        ORDER BY last_name, first_name
      `,
      values: [organizationId, facilityId]
    };
  },

  upsert(resident: Resident): SqlStatement {
    return {
      text: `
        INSERT INTO residents (
          id,
          organization_id,
          facility_id,
          preferred_name,
          first_name,
          last_name,
          room,
          level_of_care,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE
        SET preferred_name = EXCLUDED.preferred_name,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            room = EXCLUDED.room,
            level_of_care = EXCLUDED.level_of_care,
            status = EXCLUDED.status,
            updated_at = now()
        RETURNING id, organization_id, facility_id, preferred_name, first_name, last_name, room, level_of_care, status
      `,
      values: [
        resident.id,
        resident.organizationId,
        resident.facilityId,
        resident.preferredName ?? null,
        resident.firstName,
        resident.lastName,
        resident.room ?? null,
        resident.levelOfCare ?? null,
        resident.status
      ]
    };
  }
};

export const operationalRecordStatements = {
  selectById(id: UUID): SqlStatement { return { text: 'SELECT * FROM operational_records WHERE id = $1', values: [id] }; },
  listByModule(organizationId: UUID, module: string): SqlStatement { return { text: 'SELECT * FROM operational_records WHERE organization_id = $1 AND module = $2 ORDER BY updated_at DESC', values: [organizationId, module] }; },
  listByResident(residentId: UUID, module?: string): SqlStatement {
    return module
      ? { text: 'SELECT * FROM operational_records WHERE resident_id = $1 AND module = $2 ORDER BY updated_at DESC', values: [residentId, module] }
      : { text: 'SELECT * FROM operational_records WHERE resident_id = $1 ORDER BY updated_at DESC', values: [residentId] };
  },
  upsert(record: OperationalRecord): SqlStatement {
    return { text: `
      INSERT INTO operational_records (id, organization_id, facility_id, resident_id, module, record_type, status, data, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10)
      ON CONFLICT (id) DO UPDATE SET record_type=EXCLUDED.record_type, status=EXCLUDED.status, data=EXCLUDED.data, updated_at=EXCLUDED.updated_at
      RETURNING *
    `, values: [record.id, record.organizationId, record.facilityId ?? null, record.residentId ?? null, record.module, record.recordType, record.status, JSON.stringify(record.data), record.createdAt, record.updatedAt] };
  }
};

export const featureRegistryStatements = {
  insert(feature: RegisteredFeature, id: UUID): SqlStatement {
    return {
      text: `
        INSERT INTO feature_registry (id, feature_name, module, status, dependencies, version)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6)
        ON CONFLICT (feature_name) DO UPDATE
        SET module = EXCLUDED.module,
            status = EXCLUDED.status,
            dependencies = EXCLUDED.dependencies,
            version = EXCLUDED.version
        RETURNING feature_name, module, status, dependencies, version
      `,
      values: [id, feature.featureName, feature.module, feature.status, JSON.stringify(feature.dependencies), feature.version]
    };
  },

  list(): SqlStatement {
    return {
      text: 'SELECT feature_name, module, status, dependencies, version FROM feature_registry ORDER BY module, feature_name',
      values: []
    };
  }
};

export const auditLogStatements = {
  append(event: AuditEvent): SqlStatement {
    return {
      text: `
        INSERT INTO audit_logs (
          id,
          action,
          actor_user_id,
          actor_role,
          entity_type,
          entity_id,
          organization_id,
          facility_id,
          resident_id,
          before_state,
          after_state,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12)
      `,
      values: [
        event.id,
        event.action,
        event.actorUserId,
        event.actorRole,
        event.entityType,
        event.entityId,
        event.organizationId ?? null,
        event.facilityId ?? null,
        event.residentId ?? null,
        JSON.stringify(event.beforeState),
        JSON.stringify(event.afterState),
        event.timestamp
      ]
    };
  },

  listByEntity(entityType: string, entityId: UUID): SqlStatement {
    return {
      text: `
        SELECT *
        FROM audit_logs
        WHERE entity_type = $1
          AND entity_id = $2
        ORDER BY created_at DESC
      `,
      values: [entityType, entityId]
    };
  }
};

export const authSessionStatements = {
  selectById(id: UUID): SqlStatement {
    return {
      text: 'SELECT id, user_id, created_at, expires_at, mfa_verified, revoked_at FROM auth_sessions WHERE id = $1',
      values: [id]
    };
  },

  upsert(session: AuthSession): SqlStatement {
    return {
      text: `
        INSERT INTO auth_sessions (id, user_id, created_at, expires_at, mfa_verified, revoked_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE
        SET expires_at = EXCLUDED.expires_at,
            mfa_verified = EXCLUDED.mfa_verified,
            revoked_at = EXCLUDED.revoked_at
        RETURNING id, user_id, created_at, expires_at, mfa_verified, revoked_at
      `,
      values: [session.id, session.userId, session.createdAt, session.expiresAt, session.mfaVerified, session.revokedAt ?? null]
    };
  },

  revoke(id: UUID, revokedAt: string): SqlStatement {
    return {
      text: `
        UPDATE auth_sessions
        SET revoked_at = $2
        WHERE id = $1
        RETURNING id, user_id, created_at, expires_at, mfa_verified, revoked_at
      `,
      values: [id, revokedAt]
    };
  }
};

export const mfaChallengeStatements = {
  selectById(id: UUID): SqlStatement {
    return {
      text: 'SELECT id, user_id, created_at, expires_at, verified_at FROM mfa_challenges WHERE id = $1',
      values: [id]
    };
  },

  upsert(challenge: MfaChallenge): SqlStatement {
    return {
      text: `
        INSERT INTO mfa_challenges (id, user_id, created_at, expires_at, verified_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE
        SET verified_at = EXCLUDED.verified_at
        RETURNING id, user_id, created_at, expires_at, verified_at
      `,
      values: [challenge.id, challenge.userId, challenge.createdAt, challenge.expiresAt, challenge.verifiedAt ?? null]
    };
  }
};

export const passwordResetStatements = {
  selectById(id: UUID): SqlStatement {
    return {
      text: 'SELECT id, user_id, created_at, expires_at, used_at FROM password_reset_requests WHERE id = $1',
      values: [id]
    };
  },

  upsert(request: PasswordResetRequest): SqlStatement {
    return {
      text: `
        INSERT INTO password_reset_requests (id, user_id, created_at, expires_at, used_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE
        SET used_at = EXCLUDED.used_at
        RETURNING id, user_id, created_at, expires_at, used_at
      `,
      values: [request.id, request.userId, request.createdAt, request.expiresAt, request.usedAt ?? null]
    };
  }
};

function selectUser(whereClause: string, values: unknown[], orderBy = ''): SqlStatement {
  return {
    text: `
      SELECT
        u.id,
        u.email,
        u.organization_id,
        u.status,
        r.tier AS role_tier,
        COALESCE(array_agg(DISTINCT uf.facility_id) FILTER (WHERE uf.facility_id IS NOT NULL), ARRAY[]::uuid[]) AS facility_ids,
        COALESCE(array_agg(DISTINCT p.key) FILTER (WHERE p.key IS NOT NULL), ARRAY[]::text[]) AS permissions
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN user_facilities uf ON uf.user_id = u.id
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE ${whereClause}
      GROUP BY u.id, u.email, u.organization_id, u.status, r.tier
      ${orderBy}
    `,
    values
  };
}
