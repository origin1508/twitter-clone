
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts?followingOnly=true', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        })
    .then(res => res.json())
    .then(results => {
        
        outputPosts(results, $(".postsContainer"));
    })
    .catch(err => {console.log(err)})
})