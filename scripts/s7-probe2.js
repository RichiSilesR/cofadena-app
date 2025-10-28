const s7 = require('nodes7');
const conn = new s7();
const host = process.argv[2] || '192.168.10.3';

const tags = ['VW2','VW4','VW6','V8.0','V8.1','V8.2','V8.3','V8.4','V8.5','V9.5'];

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

// Patterns to try: common S7/logical variants
const tries = [];
for (let i=0;i<200;i+=2){
  tries.push((t)=>t.replace(/(\d+)$/, (m)=>m));
}
// Add explicit formats per tag
const formats = [
  (t)=>t, // as-is
  (t)=>t.replace(/^VW(\d+)$/,'MW$1'),
  (t)=>t.replace(/^VW(\d+)$/,'DB1,DBW$1'),
  (t)=>t.replace(/^VW(\d+)$/,'DB2,DBW$1'),
  (t)=>t.replace(/^VW(\d+)$/,'VB$1'),
  (t)=>t.replace(/^V(\d+)\.(\d+)$/,'M$2'),
  (t)=>t.replace(/^V8\.(\d+)$/,'M8.$1'),
  (t)=>t.replace(/^V8\.(\d+)$/,'Q$1'),
  (t)=>t.replace(/^V(\d+)\.(\d+)$/,'DB1,DBX$1.$2'),
  (t)=>t.replace(/^V(\d+)\.(\d+)$/,'DB1,DBB$1'),
];

async function probe(){
  console.log('Conectando a',host);
  conn.initiateConnection({ host, port: 102, rack:0, slot:1 }, async (err)=>{
    if(err) return console.error('Conn failed:',err);
    console.log('Conectado. Probando direcciones...');

    for(const tag of tags){
      let ok=false;
      for(const f of formats){
        const addr = f(tag);
        if(!addr || addr===tag && tag.startsWith('V8.')){
          // skip useless
        }
        try{
          conn.setTranslationCB((t)=> t==='PROBE'?addr:t);
          try{ conn.addItems(['PROBE']); } catch(e){}
          await sleep(150);
          await new Promise((res)=>{
            conn.readAllItems((err,values)=>{
              if(!err && values && Object.keys(values).length){
                console.log(`OK: ${tag} -> ${addr} =>`, values);
                ok=true;
              }
              try{ conn.dropItems(['PROBE']); } catch(e){}
              res();
            });
          });
          if(ok) break;
        }catch(e){/* ignore */}
      }
      if(!ok) console.log(`NO encontrado para ${tag}`);
    }

    console.log('Sondeo finalizado.');
    conn.dropConnection();
  });
}

probe();
