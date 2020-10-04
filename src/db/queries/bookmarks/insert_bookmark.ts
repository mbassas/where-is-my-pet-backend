
const insertBookmarkQuery = `
INSERT INTO bookmarks (
    user_id,
    animal_id
) 
VALUES (
    $1,
    $2
)
`
export default insertBookmarkQuery;
