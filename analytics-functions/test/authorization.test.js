'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {isWorkspaceMember} = require('../authorization');
const config = {allowedEmails: ['owner@gmail.com']};
const legacy = {uid: 'owner', token: {email: 'owner@gmail.com', email_verified: false,
  firebase: {sign_in_provider: 'google.com', identities: {'google.com': ['google-owner']}}}};
const owner = {disabled: false, email:'owner@gmail.com', providerData: [{providerId: 'google.com', uid: 'google-owner', email: 'owner@gmail.com'}]};

test('legacy owner requires matching authenticated Google identity and invited Gmail address', async () => {
  assert.equal(await isWorkspaceMember(legacy, config, async () => owner), true);
  assert.equal(await isWorkspaceMember({...legacy, token: {...legacy.token, firebase: {sign_in_provider: 'password'}}}, config, async () => owner), false);
  assert.equal(await isWorkspaceMember(legacy, config, async () => ({...owner, disabled: true})), false);
  assert.equal(await isWorkspaceMember(legacy, config, async () => ({...owner, providerData: [{...owner.providerData[0], email: 'other@gmail.com'}]})), false);
  assert.equal(await isWorkspaceMember(legacy, config, async () => ({...owner, providerData: [{...owner.providerData[0], uid: 'different-google'}]})), false);
  assert.equal(await isWorkspaceMember(legacy, {allowedEmails: []}, async () => owner), false);
});

test('verified invited accounts and trusted viewer claims retain access', async () => {
  assert.equal(await isWorkspaceMember({uid:'owner',token: {email: 'OWNER@gmail.com', email_verified: true}}, config, async()=>owner), true);
  const reader={email:'reader@example.com',customClaims:{dashboardViewer:true}};
  const auth={uid:'reader',token: {email: 'reader@example.com', email_verified: true, dashboardViewer: true}};
  assert.equal(await isWorkspaceMember(auth, config, async()=>reader), true);
  assert.equal(await isWorkspaceMember({...auth,token:{...auth.token,email_verified:false}}, config, async()=>reader), false);
  assert.equal(await isWorkspaceMember(auth, config, async()=>({...reader,customClaims:{}})), false);
  assert.equal(await isWorkspaceMember(auth, config, async()=>({...reader,disabled:true})), false);
});

test('verified tokens respect live disable, identity changes and session revocation',async()=>{
  const auth={uid:'owner',token:{email:'owner@gmail.com',email_verified:true,auth_time:1760000000}};
  assert.equal(await isWorkspaceMember(auth,config,async()=>({...owner,disabled:true})),false);
  assert.equal(await isWorkspaceMember(auth,config,async()=>({...owner,email:'changed@gmail.com'})),false);
  assert.equal(await isWorkspaceMember(auth,config,async()=>({...owner,tokensValidAfterTime:new Date(1760000001000).toISOString()})),false);
  assert.equal(await isWorkspaceMember(auth,config,async()=>({...owner,tokensValidAfterTime:new Date(1760000000000).toISOString()})),true);
});
