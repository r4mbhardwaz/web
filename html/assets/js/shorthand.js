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

    get classList() {
        return {
            add     : (className) => { this.list.forEach(el => { el.classList.add(className)    }) },
            remove  : (className) => { this.list.forEach(el => { el.classList.remove(className) }) },
            toggle  : (className) => { this.list.forEach(el => { el.classList.toggle(className) }) }
        }
    }

    forEach(callback)  {  this.list.forEach(callback);                                               }
    change(callback)   {  this.list.forEach(el => { el.addEventListener("change", callback); });     }
    input(callback)    {  this.list.forEach(el => { el.addEventListener("input", callback); });      }
    click(callback)    {  if (!callback) { 
                                this.list.forEach(el => el.click()); 
                                return 
                            }
                            this.list.forEach(el => { el.addEventListener("click", callback); });      }
    hover(callback)    {  this.list.forEach(el => { el.addEventListener("mouseover", callback); });  }
    blur(callback)     {  this.list.forEach(el => { el.addEventListener("mouseout", callback); });   }
    text(txt)          {  this.list.forEach(el => el.innerHTML = txt);                               }
    val(txt)           {  this.list.forEach(el => el.value = txt);                                   }
    
    enter(callback)  {
        if (!callback) {
            this.list.forEach(el => {
                el.dispatchEvent(new KeyboardEvent("keypress", {
                    bubbles: true,
                    cancelable: true,
                    keyCode: 13,
                    key: "Enter"
                }));
            });
            return;
        }
        this.list.forEach(el => {
            el.addEventListener("keypress", ev => {
                if (ev.key == "Enter" || ev.keyCode == 13) {
                    callback(ev);
                }
            })
        })
    }

    get(index) {
        return this.list[index];
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