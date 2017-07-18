'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const alexa = require('alexa-app')
const wol = require('wake_on_lan')

const config = require('./config')

// express config
const app = express()
app.set('port', (process.env.PORT || config.PORT || 3001))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')

// alexa app config
const alexaApp = new alexa.app('wake-on-lan')
alexaApp.express({
  expressApp: app,
  checkCert: false,
  endpoint: 'wol',
  debug: true
})

alexaApp.launch((request, response) => {
  console.log(`App Launched`)

  response.say(`Tell me the device you want to switch on.`)

  response.shouldEndSession(false, 'I said tell me the device you want to switch on.')

  response.send()
})

alexaApp.intent('WakeUp', {
  slots: {
    TOPIC: 'COMPUTER'
  },
  utterances: ['switch on {TOPIC}', 'wake up {TOPIC}', 'turn on {TOPIC}']
}, (request, response) => {
  const topic = request.slot('TOPIC')
  console.log(topic)
  wol.wake('D8:CB:8A:A3:03:A4', function (error) {
    if (error) {
      response.say('There was an error. Please check my logs.')
      console.log(error)
    } else {
      response.say(`${topic} woken up.`)
      console.log('awake')
      response.send()
    }
  })
})

app.get('/schema', function (request, response) {
  response.send(`<pre>${alexaApp.schema()}</pre>`)
})

app.get('/utterances', function (request, response) {
  response.send(`<pre>${alexaApp.utterances()}</pre>`)
})

// launch server
app.listen(app.get('port'), () => console.log(`Alexa Node App wake-on-lan running at localhost ${app.get('port')}`))
