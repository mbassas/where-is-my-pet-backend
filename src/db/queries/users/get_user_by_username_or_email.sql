SELECT 
    u.*,
    ustat.value as status
FROM users u 
    LEFT JOIN user_status ustat ON u.status_id = ustat.id
WHERE 
    email_hash = $1
    OR username_hash = $1;