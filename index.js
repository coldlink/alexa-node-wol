'use strict'

const express = require('express')
const alexa = require('alexa-app')

const PORT = process.env.port || 8080
const app = express()

const alexaApp = new alexa.app('wol')
const wol = require('wake_on_lan')

alexaApp.express({
  expressApp: app,
  checkCert: false,
  debug: true
})

app.set('view engine', 'ejs')

alexaApp.launch((request, response) => {
  console.log('app launched')
  response.say('Who do you want me to wake up?')
})

alexaApp.intent('wakeUp', {
  'slots': { 'NAME': 'NAME' },
  'utterances': [
    'wake up {NAME}',
    'switch on {NAME}',
    'turn on {NAME}'
  ]
}, (request, response) => {
  const name = request.slot('NAME')
  wol.wake('D8:CB:8A:A3:03:A4', function (error) {
    if (error) {
      response.say(`There was an error. I could not wake up ${name}`)
      console.log(error)
    } else {
      response.say(`I woke up ${name}`)
      console.log('awake')
    }
  })
})

app.listen(PORT)
console.log(`Listening on port ${PORT}`)
