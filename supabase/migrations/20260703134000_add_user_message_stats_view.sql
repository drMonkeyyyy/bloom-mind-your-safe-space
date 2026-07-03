CREATE OR REPLACE VIEW user_message_stats AS
SELECT user_id, count(*) as total_replies
FROM messages
WHERE role = 'assistant'
GROUP BY user_id;
