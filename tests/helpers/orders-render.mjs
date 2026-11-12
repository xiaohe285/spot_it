import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import * as React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const loadModule=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const styles=[];
function component(file, mocks={}, prefix='preview_') {
  const source=fs.readFileSync(path.join(root,file),'utf8');
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const mod={exports:{}};
  const localRequire=id=>{
    if(id in mocks)return mocks[id];
    if(id==='next/link')return {__esModule:true,default:props=>React.createElement('a',props)};
    if(id.endsWith('.module.css')){
      const css=fs.readFileSync(path.resolve(root,path.dirname(file),id),'utf8');
      styles.push(css.replace(/\.([a-zA-Z_][\w-]*)/g,(_,key)=>'.'+prefix+key));
      return {__esModule:true,default:new Proxy({},{get:(_,key)=>prefix+key})};
    }
    return loadModule(id);
  };
  new Function('require','module','exports',output)(localRequire,mod,mod.exports);
  return mod.exports.default;
}
export function renderAccount({active=false,error=null,loading=false,user={id:'qa-user',email:'jack@example.test',user_metadata:{display_name:'Jack'}},open=false}={}) {
  const Account=component('components/account/AccountMenu.tsx',{
    react:{...React,useState:initial=>React.useState(initial===false?open:initial)},
    '@/contexts/AuthContext':{useAuth:()=>({user,signOut:async()=>{}})},
    '@/contexts/PremiumContext':{usePremium:()=>({status:{active},error,loading})},
  },'account_');
  return renderToStaticMarkup(React.createElement(Account));
}
export function renderPreview(){
  const user={id:'qa-user',email:'jack@example.test',user_metadata:{display_name:'Jack'}};
  const payments=[{paymentId:'PAY_example_renewal',orderId:'ORD_example_membership',productName:'SpotDiffs Premium Monthly',amount:'9.00',currency:'USD',paidAt:'2026-11-10T10:20:30Z',mode:'test'},{paymentId:'PAY_example_first',orderId:'ORD_example_membership',productName:'SpotDiffs Premium Monthly',amount:'9.00',currency:'USD',paidAt:'2026-10-10T10:20:30Z',mode:'test'}];
  const status={active:true,plan:'monthly',expiresAt:'2026-12-10T00:00:00Z',resetsAt:'2026-12-10T00:00:00Z',remaining:8,billingStatus:'active',waffoMode:'test'};
  const Page=component('app/my-orders/MyOrdersClient.tsx',{
    react:{...React,useState:initial=>React.useState(initial&&typeof initial==='object'&&'identity'in initial?{identity:user.id,page:1,loading:false,data:{payments,page:1,hasMore:false},error:'',requiresLogin:false}:initial)},
    '@/contexts/AuthContext':{useAuth:()=>({user,session:{access_token:'fixture-only'},loading:false})},
    '@/contexts/PremiumContext':{usePremium:()=>({status,loading:false,error:null,refresh:async()=>{}})},
    '@/lib/premium/plans':{premiumPlans:[{id:'monthly',name:'Monthly'}]},
    '@/lib/premium/clientAuth':{premiumAuthHeaders:async()=>({})},
    '@/components/auth/AuthModal':{__esModule:true,default:()=>null},
  },'orders_');
  const body=renderToStaticMarkup(React.createElement(Page));
  const account=renderAccount({active:true});
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Orders UI fixture</title><style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif}h1,h2,h3,p,dl,dd{margin:0}button,a{font:inherit}button{border:0;background:none}a{text-decoration:none;color:inherit}header.preview{display:flex;align-items:center;justify-content:space-between;height:76px;padding:0 max(24px,calc((100vw - 1120px)/2));background:white;border-bottom:1px solid #eee5d7}.brand{font-size:24px;font-weight:800;color:#ef632f}.fixture{font-size:11px;color:#897666}'+styles.join('\n')+'@media(prefers-color-scheme:dark){header.preview{background:#211b15;border-color:#4e3e2b}.fixture{color:#c4b29e}}'+'</style></head><body><header class="preview"><span class="brand">SpotDiffs <span class="fixture">UI preview · sample records</span></span>'+account+'</header>'+body+'</body></html>';
}
if(process.argv[1] && fileURLToPath(import.meta.url)===path.resolve(process.argv[1]))fs.writeFileSync('/tmp/spot-it-orders-preview.html',renderPreview());
