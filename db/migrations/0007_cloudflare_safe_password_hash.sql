UPDATE auth_credentials
SET
  password_hash = 'jjRNJba7u1HTC5hWc0UFVCeCFzMIfv+Wy7ENKjWi04Q=',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE user_id = 'usr_admin' AND email = 'admin@mail.com';
