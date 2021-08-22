window.editor = new CodeFlask('#code-editor', { 
    language: 'py',
    lineNumbers: true
});

window.editor.addLanguage("py", RawPrism.languages.python);


console.log(RawPrism);
