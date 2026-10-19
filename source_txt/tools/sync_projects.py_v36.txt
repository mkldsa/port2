"""Optional local-preview cache: hosted pages read folder JSON directly."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
ids=json.loads((root/'projects/projects.json').read_text(encoding='utf-8'))
assert isinstance(ids,list),'projects/projects.json must be an array'
records=[];seen=set()
for item in ids:
 key=item if isinstance(item,str) else item['id']
 if key in seen:continue
 assert re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]*',key),key
 seen.add(key)
 records.append({'folder':key,'data':json.loads((root/'projects'/key/'project.json').read_text(encoding='utf-8'))})
target=root/'data/project-snapshot.js'
target.write_text('/* Local preview cache; generated from folder JSON. */\nwindow.PORTFOLIO_SNAPSHOT = '+json.dumps(records,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('Local preview cache updated:',len(records),'projects')
