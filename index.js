'use strict'

const express = require('express')
const alexa = require('alexa-app')
const wol = require('wake_on_lan')

const config = require('./config')

const PORT = process.env.PORT || config.PORT || 8080
const app = express()

const alexaApp = new alexa.app('wol')

const getMac = name => {
  const device = config.devices.find(dev => dev.name.findIndex(_name => _name.toLowerCase() === name.toLowerCase()) !== -1)
  return device ? device.mac : null
}

const wakeUpDevice = mac => new Promise((resolve, reject) => {
  if (!mac) {
    return reject(new Error(404))
  }
  wol.wake(mac, (err) => {
    if (err) {
      return reject(err)
    }
    return resolve()
  })
})

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
  console.log(name)

  return wakeUpDevice(getMac(name))
    .then(() => {
      return response.say(`I've woken up ${name}.`)
    })
    .catch(err => {
      if (err === 404) {
        return response.say(`I could not find ${name}`)
      }
      console.log(err)
      return response.say('There was an error, check the logs for more details.')
    })
})

app.listen(PORT)
console.log(`Listening on port ${PORT}`)
