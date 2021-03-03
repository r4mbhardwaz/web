window.ElementList = class {
    constructor(elementList) {
        this.list = [];
        if (elementList instanceof Element) {
            this.list.push(elementList);
        } else if (elementList instanceof NodeList) {
            for (let i = 0; i < elementList.length; i++) {
                const element = elementList[i];
                this.list.push(element);
            }
        }
    }

    change(callback) {
        this.list.forEach(el => { el.addEventListener("change", callback); });
    }
    
    input(callback) {
        this.list.forEach(el => { el.addEventListener("input", callback); });
    }

    click(callback) {
        this.list.forEach(el => { el.addEventListener("click", callback); });
    }

    enter(callback) {
        this.list.forEach(el => {
            el.addEventListener("keypress", ev => {
                if (ev.keyCode == 13) {
                    callback(ev);
                }
            })
        })
    }

    get value() {
        let arr = []
        this.list.forEach(el => { arr.push(el.value) })
        return arr;
    }
}

window.id = function(id) {
    return new ElementList(document.getElementById(id));
}

window.qry = function(qryString) {
    return new ElementList(document.querySelectorAll(qryString));
}