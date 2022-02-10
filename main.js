const fetch = require('node-fetch')

const createSessions = (arr) => {
    let finalSession = []
    let separatingSessions = []
    let tempSession = []
    arr.sort((a, b) => (a.timestamp <= b.timestamp) ? -1 : 1)
    let currentTimeStamp = arr[0].timestamp
    for (let i = 0; i<arr.length; i++){ 
        if ( Math.abs(currentTimeStamp - arr[i].timestamp) <= 600000){
            tempSession.push(arr[i])
            currentTimeStamp = tempSession.at(-1).timestamp
        }
        else{
            currentTimeStamp = arr[i].timestamp
            separatingSessions.push(tempSession)
            tempSession = [arr[i]]
        }
    }
    separatingSessions.push(tempSession)
    
    for (let i = 0; i < separatingSessions.length; i++){
        let pages = []
        for (let j = 0; j < separatingSessions[i].length; j++){
            pages.push(separatingSessions[i][j].url)
        }
        let session = {
            duration: Math.abs(separatingSessions[i][0].timestamp - separatingSessions[i].at(-1).timestamp),
            pages: pages,
            startTime: separatingSessions[i][0].timestamp
        }
        finalSession.push(session)
    }
    console.log(finalSession)
    return finalSession
}

fetch('https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=3d03f4e7a4aa383f653c7cdac740', {
    method: 'GET',
    headers: {
        "Content-Type": "application/json",
    },
})
.then( res => res.json())
.then( data => {
    let tempData = {}
    let returnObject = {}
    data['events'].forEach(element => {
        if(element.visitorId in tempData){
            tempData[element.visitorId].push({url: element.url, timestamp: element.timestamp})
        }
        else{
            tempData[element.visitorId] = [{url: element.url, timestamp: element.timestamp}]
        }
    })
    for (const [key, value] of Object.entries(tempData)){
        returnObject[key] = createSessions(value)
    }

    let finalObject = {
        sessionsByUser: returnObject
    }

    fetch('https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=3d03f4e7a4aa383f653c7cdac740', {
        method: 'POST',
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(finalObject)
    })
    .then(res => res.json())
    .then(answer => console.log(answer))
})

    
// [{url: twitter, timestmap:'134iy134u']