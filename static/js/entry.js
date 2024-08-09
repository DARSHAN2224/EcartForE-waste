document.getElementById('files').addEventListener('change', function(event) {
    const files = event.target.files;
    const preview = document.getElementById('preview');
    preview.innerHTML = '';

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            let element;
            if (file.type.startsWith('image/')) {
                element = document.createElement('img');
                element.src = e.target.result;
            } else {
                element = document.createElement('div');
                element.classList.add('file-info');
                element.textContent = file.name;
            }
            preview.appendChild(element);
        }
        reader.readAsDataURL(file);
    });
});
