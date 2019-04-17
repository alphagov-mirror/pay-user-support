'use strict'

// NPM dependencies
const logger = require('pino')

// Local dependencies
const zendesk = require('../../common/clients/zendesk')
const { validator } = require('../../common/utils/field-validator')
// const { paths } = require('./index.js')

module.exports = (req, res) => {
  const ticket = {
    email: req.body['email'],
    name: req.body['name'],
    subject: 'Support submission: Report a problem with my live service',
    message: req.body['message'],
    type: 'question'
  }

  const errors = validator([
    {
      name: 'message',
      type: 'string',
      validate: 'required',
      value: req.body['message'],
      label: 'Describe the problem',
      id: 'message',
      message: 'This field is required'
    },
    {
      name: 'name',
      type: 'string',
      validate: 'required',
      value: req.body['name'],
      label: 'Name',
      id: 'name',
      message: 'This field is required'
    },
    {
      name: 'email',
      type: 'email',
      validate: 'email',
      value: req.body['email'],
      label: 'Email',
      id: 'email',
      message: 'Please use a valid email address'
    }
  ])

  if (errors) {
    req.flash('error', errors)
    return res.redirect('/somethings-wrong')
  }

  zendesk.createTicket(ticket)
    .then(() => {
      console.log('success')
      req.flash('info', {
        title: 'Thanks for your feedback'
      })
      return res.redirect('/somethings-wrong')
    })
    .catch(err => {
      console.log('fail')
      logger('error', `Error posting request to Zendesk - ${err}`)
      req.flash('error', {
        message: 'We couldn’t send your feedback, please try again'
      })
      return res.redirect('/somethings-wrong')
    })
}
