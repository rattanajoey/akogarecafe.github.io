import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardWorkspace } from './Dashboard';
import { dateRange } from './data';

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
  expect(cards[0].textContent).toContain('2 of 6 sources with growth');
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
