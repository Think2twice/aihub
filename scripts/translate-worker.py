"""
翻译工作进程 - 使用腾讯云翻译 API
限制：每秒最多5次请求
"""
import sys, json, os, time

# 从 .env 读取密钥
SECRET_ID = ''
SECRET_KEY = ''
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
for line in open(env_path):
    line = line.strip()
    if line.startswith('TENCENT_TRANSLATE_SECRET_ID='):
        SECRET_ID = line.split('=', 1)[1].strip().strip('"\'')
    elif line.startswith('TENCENT_TRANSLATE_SECRET_KEY='):
        SECRET_KEY = line.split('=', 1)[1].strip().strip('"\'')

if not SECRET_ID or not SECRET_KEY:
    print('ERROR: 需要 TENCENT_TRANSLATE_SECRET_ID 和 TENCENT_TRANSLATE_SECRET_KEY', file=sys.stderr)
    sys.exit(1)

from tencentcloud.common import credential
from tencentcloud.tmt.v20180321 import tmt_client, models

cred = credential.Credential(SECRET_ID, SECRET_KEY)
client = tmt_client.TmtClient(cred, 'ap-guangzhou')

# 参数：输入文件 输出文件
input_file = sys.argv[1] if len(sys.argv) > 1 else None
output_file = sys.argv[2] if len(sys.argv) > 2 else None
if input_file:
    lines = open(input_file, 'r', encoding='utf-8').read().strip()
else:
    lines = sys.stdin.read().strip()

if not lines:
    sys.exit(0)

texts = json.loads(lines)
results = {}

for i, text in enumerate(texts):
    if not text or not text.strip():
        results[text] = text
        continue
    
    # 限速：每秒最多4次（留余量）
    if i > 0 and i % 4 == 0:
        time.sleep(1)
    
    try:
        req = models.TextTranslateRequest()
        req.SourceText = text[:2000]
        req.Source = 'en'
        req.Target = 'zh'
        req.ProjectId = 0
        resp = client.TextTranslate(req)
        results[text] = resp.TargetText
    except Exception as e:
        print(f"WARN [{text[:40]}]: {e}", file=sys.stderr)
        results[text] = text  # 失败用原文

json_output = json.dumps(results, ensure_ascii=True)
if output_file:
    open(output_file, 'w', encoding='utf-8').write(json_output)
else:
    print(json_output)
