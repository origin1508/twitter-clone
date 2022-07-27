const postTextarea = document.querySelector('#postTextarea');

postTextarea.addEventListener('keyup', (e) => {
    const textbox = e.target;
    const value = textbox.value.trim();

    const submitPostButton = document.querySelector('#submitPostButton');
    
    if(submitPostButton == 0) return alert("no submit button found")

    if(value == "") {
        submitPostButton.disabled = true;
        return;
    }

    submitPostButton.disabled = false;
})