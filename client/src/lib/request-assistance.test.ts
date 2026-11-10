import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REQUEST_CHOICES, DELIVERABLES, filterParts, demoAssistanceAdapter, type PartMatch } from './request-assistance';

const sample: PartMatch[] = [
  {id:'1',aircraft:'A-10 Thunderbolt II',nsn:'1010-01-234-5678',partNumber:'XYZ-100',name:'Feed Pawl',source:'demonstration'},
  {id:'2',aircraft:'F-16 Fighting Falcon',nsn:'1010-01-234-0000',partNumber:'XYZ-200',name:'Rotor Housing',source:'demonstration'},
  {id:'3',aircraft:'A-10 Thunderbolt II',nsn:'1010-01-555-1111',partNumber:null,name:'Barrel Support Bracket',source:'demonstration'},
];
const empty = {aircraft:'',nsn:'',partNumber:'',description:''};

test('retains UMW five request types and four deliverable choices', () => {
  assert.deepEqual(REQUEST_CHOICES.map(x=>x.id),['redesign','new','transform','alternatives','production']);
  assert.deepEqual(DELIVERABLES.map(x=>x.id),['cad','II','III','custom']);
});
test('normalizes NSN punctuation and uses combined AND filters', () => {
  const rows=filterParts(sample,{...empty,aircraft:'A-10 Thunderbolt II',nsn:'1010012345678',description:'feed'});
  assert.equal(rows.length,1);
  assert.equal(rows[0].id,'1');
});
test('does not incorrectly match unknown part numbers', () => {
  assert.deepEqual(filterParts(sample,{...empty,partNumber:'NOT-VALID'}),[]);
  assert.deepEqual(filterParts(sample,{...empty,partNumber:'XYZ-100'}).map(x=>x.id),['1']);
});
test('part number search excludes records with no part number', () => {
  assert.deepEqual(filterParts(sample,{...empty,description:'barrel',partNumber:'XYZ'}),[]);
});
test('demo adapter never returns more than eight sample parts', async () => {
  const result=await demoAssistanceAdapter.search({...empty,aircraft:'A-10 Thunderbolt II'});
  assert.ok(result.length<=8);
  assert.ok(result.every(item=>item.source==='demonstration'));
});
