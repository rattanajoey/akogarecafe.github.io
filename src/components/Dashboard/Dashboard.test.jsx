import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DashboardWorkspace } from './Dashboard';
import { dateRange } from './data';
import { loadUsdRate } from './currency';
jest.mock('./currency', () => ({ loadUsdRate: jest.fn() }));
beforeEach(() => loadUsdRate.mockResolvedValue({ rate: 1.3368, date: '2026-10-23', source: 'ECB' }));

jest.mock('react-router-dom', () => ({ Link: ({ to, ...props }) => <a href={to} {...props} /> }));

function Workspace({ reports }) {
  const [days, setDays] = useState(28);
  return <DashboardWorkspace user={{ displayName: 'Studio' }} reports={reports} products={null} busy={false} error="" days={days} setDays={setDays} onRefresh={() => {}} onLogin={() => {}} onLogout={() => {}} onConnect={() => {}} />;
}

test('Last 1 day selects yesterday, explains processing and centers a single reported point', () => {
  const yesterday = dateRange(1).end;
  const { container } = render(<Workspace reports={{ 'cafe-youtube': { status: 'connected', metrics: { views: 0 }, daily: [{ date: yesterday, views: 0 }] } }} />);
  const period = screen.getByRole('combobox', { name: 'Reporting period' });
  expect(period.value).toBe('28');
  fireEvent.change(period, { target: { value: '1' } });
  expect(period.value).toBe('1');
  expect(screen.getByRole('note').textContent).toContain(`Last completed day · ${yesterday} (UTC)`);
  expect(screen.getByRole('note').textContent).toContain('48–72 hours');
  expect(container.querySelector('.studio-chart circle').getAttribute('cx')).toBe('393');
  expect(container.querySelectorAll('.studio-chart svg > text')).toHaveLength(1);
  fireEvent.change(period, { target: { value: '7' } });
  expect(screen.queryByRole('note')).toBeNull();
});

test('an empty daily report shows a waiting state without requesting another connection', () => {
  render(<Workspace reports={{ 'cafe-youtube': { status: 'connected', connectionState: 'processing', metrics: { followers: 10 }, daily: [] } }} />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Reporting period' }), { target: { value: '1' } });
  expect(screen.getByRole('img', { name: 'Daily report is still processing' })).toBeTruthy();
  expect(screen.getByText('Waiting for daily reports')).toBeTruthy();
  expect(screen.queryByText('Connect a reporting source to see daily performance.')).toBeNull();
});


test('summary changes show net subscribers and signed counts with explicit partial coverage', () => {
  const { container } = render(<Workspace reports={{
    'cafe-youtube': {status:'connected',metrics:{followers:1000,netFollowers:10,views:50},previous:{views:100},comparison:{matchedDays:true}},
    'watch-youtube': {status:'connected',metrics:{followers:2000,netFollowers:-3,views:0},previous:{views:0}},
    'cafe-instagram': {status:'partial',metrics:{followers:69}},
    'cafe-web': {status:'connected',metrics:{sessions:10},previous:{sessions:5}},
    'cine-web': {status:'connected',metrics:{sessions:5},previous:{sessions:10}},
    'pindo-web': {status:'connected',metrics:{sessions:100}},
    'cine-ios': {status:'connected',metrics:{activeUsers:3},previous:{activeUsers:0}},
  }}/>);
  const cards = container.querySelectorAll('.studio-summary .studio-stat');
  expect(cards[0].textContent).toContain('+7net subscribers this period');
  expect(cards[0].textContent).toContain('2 of 7 sources with growth');
  expect(cards[1].textContent).toContain('−50 (−50.0%)');
  expect(cards[1].textContent).toContain('vs prior matched days');
  expect(cards[1].textContent).toContain('2 of 5 sources compared');
  expect(cards[2].textContent).toContain('0 (0.0%)');
  expect(cards[2].textContent).toContain('2 of 3 sources compared');
  expect(cards[3].textContent).toContain('+3');
  expect(cards[3].textContent).not.toContain('Infinity');
  fireEvent.change(screen.getByRole('combobox',{name:'Reporting period'}),{target:{value:'1'}});
  expect(cards[2].textContent).toContain('vs previous day');
});

test('daily snapshot history labels collection and partial observed spans without inventing period totals', () => {
  const {container,rerender}=render(<Workspace reports={{'cafe-instagram':{status:'partial',metrics:{followers:12},audienceHistory:{state:'recording',startedAt:'2026-10-24T15:00:00Z'}}}}/>);
  expect(screen.getAllByText('Recording daily history').length).toBeGreaterThan(0);
  rerender(<Workspace reports={{'cafe-instagram':{status:'partial',metrics:{followers:12},audienceHistory:{state:'partial',change:{value:2,from:'2026-10-22',to:'2026-10-24',baselineAt:'2026-10-22T12:00:00Z',asOf:'2026-10-24T18:00:00Z',complete:false}}}}}/>);
  expect(screen.getByText('followers · 2026-10-22–2026-10-24')).toBeTruthy();
  expect(screen.getByText('Daily snapshots · partial period')).toBeTruthy();
  expect(container.querySelector('.studio-summary .studio-stat').textContent).not.toContain('+2');
});

test('complete snapshot growth can join native growth with the correct audience label',()=>{
  const{container}=render(<Workspace reports={{'cafe-youtube':{status:'connected',metrics:{followers:1000,netFollowers:8}},'cafe-instagram':{status:'partial',metrics:{followers:12,netFollowers:-2},audienceGrowth:{method:'daily-snapshot'}}}}/>);
  const audience=container.querySelector('.studio-summary .studio-stat');
  expect(audience.textContent).toContain('+6audience change this period');
  expect(audience.textContent).toContain('2 of 7 sources with growth');
  expect(audience.querySelector('.studio-change').title).toContain('Daily snapshots');
});

test('Etsy project focuses on orders and clearly labelled sales without audience or view cards',()=>{
  const{container}=render(<Workspace reports={{'etsy-shop':{status:'connected',connectionMode:'automatic',currency:'USD',metrics:{orders:3,salesAmount:15.25,buyerRefunds:0,processingFees:null},previous:{orders:1},earnings:{status:'connected',provider:'etsy',amount:15.25,currency:'USD',start:'2026-10-01',end:'2026-10-24'}}}}/>);
  expect(container.querySelector('.studio-summary .studio-stat-value').textContent).toBe('—');
  fireEvent.change(screen.getByRole('combobox',{name:'Choose project'}),{target:{value:'shop'}});
  const shop=screen.getByRole('region',{name:'Etsy shop reporting'});
  expect(shop.textContent).toContain('Paid orders3');
  expect(shop.textContent).toMatch(/Item salesUSD\s15\.25/);
  expect(shop.textContent).toContain('Card-processing fees—');
  expect(screen.queryByText('Combined audience')).toBeNull();
  expect(screen.queryByRole('img',{name:/by project and date/})).toBeNull();
  expect(screen.queryByText('Channel breakdown')).toBeNull();
  expect(screen.getByRole('region',{name:'Project earnings'}).textContent).toContain('Etsy · item sales before refunds and fees');
  expect(container.querySelector('.studio-project-metric-label').textContent).toBe('Paid orders');
});

test('Etsy fee card preserves the original currencies and shows a dated USD estimate beside foreign fees',async()=>{
  render(<Workspace reports={{'etsy-shop':{status:'connected',currency:'USD',metrics:{orders:2,processingFees:null},processingFeesByCurrency:{USD:0.35,GBP:0.4}}}}/>);
  const shop=screen.getByRole('region',{name:'Etsy shop reporting'});
  expect(shop.textContent).toMatch(/Card-processing feesUSD\s0\.35GBP\s0\.40/);
  await waitFor(() => expect(shop.textContent).toMatch(/GBP\s0\.40≈ USD\s0\.53/));
  expect(shop.textContent).toContain('Rate 2026-10-23');
  expect(shop.textContent).toContain('Original fees · USD estimates');
  expect(shop.textContent).not.toMatch(/USD\s0\.75/);
});

test('project cards separate YouTube subscribers from Instagram while the overview labels the combined count', () => {
  const { container } = render(<Workspace reports={{
    'cafe-youtube': { status:'connected', metrics:{followers:2630,netFollowers:6} },
    'cafe-instagram': { status:'partial', metrics:{followers:79} },
  }}/>);
  const card = container.querySelector('.studio-project-card');
  expect(card.querySelector('.studio-project-metric>strong').textContent).toBe('≈2,630');
  expect(card.querySelector('.studio-project-metric-label').textContent).toBe('YouTube subscribers');
  expect(card.querySelector('.studio-project-audience-detail').textContent).toBe('Instagram followers79');
  expect(container.querySelector('.studio-summary .studio-stat').textContent).toContain('Combined audience≈2,709');
  expect(screen.getByText('Subscribers · rounded')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Filter by platform'),{target:{value:'instagram'}});
  expect(card.querySelector('.studio-project-metric>strong').textContent).toBe('79');
  expect(card.querySelector('.studio-project-metric-label').textContent).toBe('Instagram followers');
  expect(card.querySelector('.studio-project-audience-detail')).toBeNull();
  expect(container.querySelector('.studio-summary .studio-stat-label').textContent).toBe('Instagram followers');
});

test('Patreon is separate from social audience and its snapshot filter never invents period growth', () => {
  const { container } = render(<Workspace reports={{
    'watch-youtube': {status:'connected',metrics:{followers:1990}},
    'watch-patreon': {status:'connected',connectionMode:'automatic',currency:'USD',metrics:{patrons:4,paidMembers:2,trialMembers:1,declinedMembers:0,lifetimeSupportCents:1234},previous:{paidMembers:100}},
  }}/>);
  expect(container.querySelector('.studio-summary .studio-stat-value').textContent).toBe('≈1,990');
  const panel=screen.getByRole('region',{name:'Patreon membership'});
  expect(panel.textContent).toContain('Paid memberships2');
  expect(panel.textContent).toContain('separate from your social audience');
  const earnings=screen.getByRole('region',{name:'Project earnings'});
  expect(earnings.textContent).toMatch(/lifetime member supportUSD\s12\.34/);
  expect(earnings.textContent).toContain('before fees');
  fireEvent.change(screen.getByLabelText('Filter by platform'),{target:{value:'patreon'}});
  expect(container.querySelectorAll('.studio-summary .studio-stat-value')[1].textContent).toBe('2');
  expect(container.querySelector('.studio-summary').textContent).not.toContain('vs previous');
  expect(container.querySelector('.studio-summary').textContent).not.toContain('−98');
  expect(container.querySelector('.studio-chart')).toBeNull();
  expect(container.querySelectorAll('.studio-project-card')).toHaveLength(1);
  expect(container.querySelector('.studio-project-card').textContent).toContain('Akogare Watch Club');
  expect(screen.getByText('Patrons with access · current')).toBeTruthy();
  fireEvent.change(screen.getByRole('combobox',{name:'Reporting period'}),{target:{value:'7'}});
  expect(earnings.textContent).toMatch(/lifetime member supportUSD\s12\.34/);
});


test('earnings distinguish period revenue, lifetime support, missing access and currency', () => {
  render(<Workspace reports={{
    'cafe-youtube':{status:'connected',earnings:{status:'connected',amount:0,currency:'USD',start:'2026-10-01',end:'2026-10-02',previousAmount:1,note:'Estimated revenue'}},
    'watch-patreon':{status:'connected',currency:'EUR',metrics:{lifetimeSupportCents:1234}},
    'cine-web':{status:'connected',earnings:{status:'connected',provider:'stripe',amount:4.55,currency:'USD',start:'2026-10-01',end:'2026-10-07',previousAmount:8,note:'Account-level payment activity'}},
  }}/>);
  const earnings=screen.getByRole('region',{name:'Project earnings'});
  expect(earnings.textContent).toMatch(/USD\s0\.00/);
  expect(earnings.textContent).toMatch(/EUR\s12\.34/);
  expect(earnings.textContent).toMatch(/USD\s4\.55/);
  expect(earnings.textContent.match(/Stripe account · net payment activity/g)).toHaveLength(1);
  expect(earnings.textContent).toContain('2026-10-01 — 2026-10-02');
  expect(earnings.textContent).toContain('Lifetime · before fees');
  expect(earnings.textContent).toContain('Unavailable');
  expect(earnings.textContent).toContain('Read-only revenue reporting is not connected');
});


test('X belongs to Cafe, keeps YouTube separate, and shows a dated manual snapshot across periods',()=>{
  const x={status:'partial',connectionState:'snapshot',connectionMode:'manual',fetchedAt:'2026-10-26T03:05:55.818Z',metrics:{followers:21,publishedItems:134},daily:[]};
  const{container}=render(<Workspace reports={{'cafe-x':x,'cafe-youtube':{status:'connected',metrics:{followers:2600}}}}/>);
  const card=container.querySelector('.studio-project-card');
  expect(card.querySelector('.studio-project-metric>strong').textContent).toBe('≈2,600');
  expect(card.textContent).toContain('X followers · snapshot21');
  expect(container.querySelectorAll('.studio-project-card')[1].textContent).not.toContain('X followers');
  const panel=screen.getByRole('region',{name:'X account snapshot'});
  expect(panel.textContent).toContain('@AkogareCafe_JR');
  expect(panel.textContent).toContain('Checked 2026-10-26 (UTC)');
  expect(panel.textContent).toContain('Total posts134');
  expect(panel.textContent).toContain('Automatic X reports are off');
  expect(panel.textContent).toContain('Growth needs another profile check');
  fireEvent.change(screen.getByLabelText('Filter by platform'),{target:{value:'x'}});
  expect(container.querySelectorAll('.studio-project-card')).toHaveLength(1);
  expect(container.querySelector('.studio-project-card').textContent).toContain('Akogare Cafe');
  expect(screen.getByText('0 of 1 sources connected')).toBeTruthy();
  expect(screen.getByText('Followers · checked 2026-10-26')).toBeTruthy();
  expect(container.querySelector('.studio-chart')).toBeNull();
  expect(container.querySelector('.studio-summary')).toBeNull();
  fireEvent.change(screen.getByRole('combobox',{name:'Reporting period'}),{target:{value:'7'}});
  expect(panel.textContent).toContain('Checked 2026-10-26 (UTC)');
  expect(panel.textContent).toContain('Followers21');
  expect(panel.textContent).not.toContain('0 impressions');
});


test('an unavailable exchange rate retains the original Etsy fee without a fabricated USD equivalent',async()=>{
  loadUsdRate.mockResolvedValue(null);
  render(<Workspace reports={{'etsy-shop':{status:'connected',currency:'USD',metrics:{orders:1,processingFees:null},processingFeesByCurrency:{GBP:0.65}}}}/>);
  const shop=screen.getByRole('region',{name:'Etsy shop reporting'});
  await waitFor(()=>expect(shop.textContent).toContain('USD estimate unavailable'));
  expect(shop.textContent).toMatch(/GBP\s0\.65/);
  expect(shop.textContent).not.toContain('≈ USD');
});
