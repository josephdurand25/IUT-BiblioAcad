local permissions = {
    map = {
        ["/v1/users"] = { permissions = { "users:read", "users:view" }, backend = "http://auth-service" },
        ["/v1/users/loadUsers"] = { permissions = { "users:read", "users:view" }, backend = "http://auth-service" },
        ["/v1/users/assign-permission"] = { permissions = { "permissions:assign" }, backend = "http://auth-service" },
        ["/v1/users/revoke-permission"] = { permissions = { "permissions:revoke" }, backend = "http://auth-service" },
        ["/v1/users/assign-role"] = { permissions = { "roles:assign" }, backend = "http://auth-service" },
        ["/v1/users/revoke-role"] = { permissions = { "roles:revoke" }, backend = "http://auth-service" },
        ["/v1/users/profile"] = { permissions = { "users:profile-own" }, backend = "http://auth-service" },
        ["/v1/users/change-status"] = { permissions = { "users:manage-status" }, backend = "http://auth-service" },
        ["/v1/permissions/read"] = { permissions = { "permissions:read" }, backend = "http://auth-service" },
        ["/v1/permission/create"] = { permissions = { "permissions:create" }, backend = "http://auth-service" },
        ["/v1/permissions/(%d+)$"] = { permissions = { "permissions:update", "permissions:delete" }, backend = "http://auth-service" },
        ["/v1/roles"] = { permissions = { "roles:read" }, backend = "http://auth-service" },
        ["/v1/roles/read"] = { permissions = { "roles:read" }, backend = "http://auth-service" },
        ["/v1/roles/create"] = { permissions = { "roles:create" }, backend = "http://auth-service" },
        ["/v1/roles/(%d+)$"] = { permissions = { "roles:update", "roles:delete" }, backend = "http://auth-service" },
        ["/v1/users/agents"] = { permissions = { "agents:view" }, backend = "http://auth-service" },
        ["/v1/agents/create"] = { permissions = { "agents:create" }, backend = "http://auth-service" },
        ["/v1/agents/(%d+)$"] = { permissions = { "agents:update", "agents:delete" }, backend = "http://auth-service" },
        ["/v1/requests-service"] = { permissions = { "requests:view" }, backend = "http://requests-service" },
        ["/v1/candidatures"] = { permissions = { "candidatures:view", "candidatures:read" }, backend = "http://fleet-service" },
        ["/v1/candidature"] = { permissions = { "candidatures:create" }, backend = "http://fleet-service" },
        ["/v1/candidature/new"] = { permissions = { "candidatures:create" }, backend = "http://fleet-service" },
        ["/v1/candidature/(%d+)$"] = { permissions = { "candidatures:view" }, backend = "http://fleet-service" },
        ["/v1/candidature/(%d+)$/toggle"] = { permissions = { "candidatures:active", "candidatures:inactive" }, backend = "http://fleet-service" },
        ["/v1/candidatures/stats"] = { permissions = { "candidatures:view", "candidatures:read" }, backend = "http://fleet-service" },
        ["/v1/candidature/approve/(%d+)$"] = { permissions = { "candidatures:approve" }, backend = "http://fleet-service" },
        ["/v1/candidature/(%d+)$/reject"] = { permissions = { "candidatures:reject" }, backend = "http://fleet-service" },
        ["/v1/candidature/(%d+)$/historique"] = { permissions = { "candidatures:view" }, backend = "http://fleet-service" },
        ["/v1/candidature/(%d+)$/documents"] = { permissions = { "candidatures:view" }, backend = "http://fleet-service" },
        -- Chauffeurs
        ["/v1/drivers"] = { permissions = { "chauffeurs:read", "chauffeurs:view" }, backend = "http://fleet-service" },
        ["/v1/driver"] = { permissions = { "chauffeurs:create" }, backend = "http://fleet-service" },
        ["/v1/driver/(%d+)$"] = { permissions = { "chauffeurs:view", "chauffeurs:update", "chauffeurs:delete" }, backend = "http://fleet-service" },

        ["/v1/financial/payment/initiate"] = { permissions = { "payment:initiate" }, backend = "http://financial-service" },

        -- Véhicules
        ["/v1/vehicules"] = { permissions = { "vehicules:read", "vehicules:view", "vehicules:create" }, backend = "http://fleet-service" },
        ["/v1/vehicules/(%d+)$"] = { permissions = { "vehicules:view", "vehicules:update", "vehicules:delete" }, backend = "http://fleet-service" },
        
        -- Positions gps
        ["/v1/gps/positions(/.*)?$"] = { permissions = { "vehicules:view", "vehicules:update", "vehicules:delete" }, backend = "http://fleet-service" },
       
        -- Dashboard data
        ["/v1/manager/stats"] = { permissions = { "vehicules:read", "chauffeurs:read", "candidatures:read" }, backend = "http://fleet-service" },
    }
}
return permissions