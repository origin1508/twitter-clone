
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts/' + postId, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        })
    .then(res => res.json())
    .then(results => {
        
        outputPostsWithReplies(results, $(".postsContainer"));
    })
    .catch(err => {console.log(err)})
})