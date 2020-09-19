SELECT 
    r.value as role
FROM user_roles ur
    LEFT JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = $1