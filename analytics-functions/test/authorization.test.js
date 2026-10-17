'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {isWorkspaceMember} = require('../authorization');
const config = {allowedEmails: ['owner@gmail.com']};
const legacy = {uid: 'owner', token: {email: 'owner@gmail.com', email_verified: false,
  firebase: {sign_in_provider: 'google.com', identities: {'google.com': ['google-owner']}}}};
const owner = {disabled: false, providerData: [{providerId: 'google.com', uid: 'google-owner', email: 'owner@gmail.com'}]};

test('legacy owner requires matching authenticated Google identity and invited Gmail address', async () => {
  assert.equal(await isWorkspaceMember(legacy, config, async () => owner), true);
  assert.equal(await isWorkspaceMember({...legacy, token: {...legacy.token, firebase: {sign_in_provider: 'password'}}}, config, async () => owner), false);
  assert.equal(await isWorkspaceMember(legacy, config, async () => ({...owner, disabled: true})), false);
  assert.equal(await isWorkspaceMember(legacy, config, async () => ({...owner, providerData: [{...owner.providerData[0], email: 'other@gmail.com'}]})), false);
  assert.equal(await isWorkspaceMember(legacy, config, async () => ({...owner, providerData: [{...owner.providerData[0], uid: 'different-google'}]})), false);
  assert.equal(await isWorkspaceMember(legacy, {allowedEmails: []}, async () => owner), false);
});

test('verified invited accounts and trusted viewer claims retain access', async () => {
  const noLookup = () => { throw new Error('Unexpected identity lookup'); };
  assert.equal(await isWorkspaceMember({token: {email: 'OWNER@gmail.com', email_verified: true}}, config, noLookup), true);
  assert.equal(await isWorkspaceMember({token: {email: 'reader@example.com', email_verified: true, dashboardViewer: true}}, config, noLookup), true);
  assert.equal(await isWorkspaceMember({token: {email: 'reader@example.com', email_verified: false, dashboardViewer: true}}, config, noLookup), false);
});
