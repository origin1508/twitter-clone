
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts', {
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