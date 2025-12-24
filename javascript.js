const container = document.querySelector(".container")
const display = document.querySelector(".display")
const operatorList = ["+", "-", "×", "÷"]

let currentOpt
let answerReturned

container.addEventListener('click', (e) => {
    if (e.target.nodeName != "BUTTON"){
        return;
    }
    changeDisplay(e)
    if (e.target.id == "equal" && getEval(e) != undefined) {
        let [num1, operator, num2] = getEval(e)
        //console.log([num1, operator, num2])
        let answer = getAnswer(num1, num2, operator)
        display.textContent = answer
        answerReturned = true
    }
    }
)

function changeDisplay(e) {
    if (e.target.id == "clear") {
        display.textContent = ""
    }
    else if (e.target.id == "back") {
        display.textContent = display.textContent.slice(0, -1)
    }
    else if (e.target.classList[0] == "operator") {
        currentOpt = e.target.textContent
        if (operatorList.includes(display.textContent.at(-1))) {
            display.textContent = display.textContent.slice(0, -1) + currentOpt
        }
        else if (display.textContent == "") {
            return
        }
        else if (operatorList.some(opt => display.textContent.includes(opt))){
            const equalBtn = document.getElementById("equal")
            equalBtn.click()
            display.textContent += currentOpt
        }
        else {
            display.textContent += currentOpt
        }
    }
    else if (e.target.id == "equal") {
        return;
    }
    else {
        if (answerReturned) {
            display.textContent = ""
        }
        if (e.target.id == "dot"){
            if (display.textContent.includes(".") && !operatorList.some(opt => display.textContent.includes(opt)) || display.textContent.match(/\d?\..*\d?\./) || display.textContent == "" || operatorList.includes(display.textContent.at(-1))) {
                return;
            }
        }
        display.textContent += e.target.textContent
    }
    answerReturned = false;
}

function getEval(e) {
    const regex = /(\d*\.*\d+)([+\-×÷])(\d*\.*\d+)/
    if (display.textContent.match(regex)) {
        let [num1, operator, num2] = display.textContent.match(regex).slice(1)
        return([num1, operator, num2])
    }
    return;
}

function getAnswer(num1, num2, operator) {
    num1 = Number(num1)
    num2 = Number(num2)
    let answer
    switch(operator){
        case "+":
            answer = num1 + num2
            break;
        case "-":
            answer = num1 - num2
            break;
        case "×":
            answer = num1 * num2
            break;
        case "÷":
            if (num2 == 0){
                alert ("Error: Division by zero.")
                return ""
            }
            answer = num1 / num2
            break;

    }
    return roundTo(answer, 3)
}

const roundTo =  function(num, decimal) {
  return Math.round(num * 10 ** decimal) / (10 ** decimal)
}