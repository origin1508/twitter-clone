
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/posts', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        })
    .then(res => res.json())
    .then(results => {
        console.log(results);
        outputPosts(results, $(".postsContainer"));
    })
    .catch(err => {console.log(err)})
})

function outputPosts(results, container) {
    container.innerText = "";

    results.forEach(result => {
        console.log(result)
        const html = createPostHtml(result);
        container.prepend(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}