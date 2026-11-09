# Figma REST `/v1/files/:key/nodes` 응답에서 노드 하나($id)를 한 줄씩 요약한다.
# 사용: jq -r --arg id '1:2546' -f summarize-node.jq <파일>.json | grep -v HIDDEN
# 출력: 타입 "이름" [x,y 폭x높이] layout gap pad fill stroke r text font comp

def hex: if . then "#" + ([.r, .g, .b] | map((. * 255 | round) as $v | ("0123456789abcdef"[($v / 16 | floor):($v / 16 | floor) + 1]) + ("0123456789abcdef"[($v % 16):($v % 16) + 1])) | join("")) else "" end;

def find($id): if .id == $id then . else (.children // [] | .[] | find($id)) end;

def line(d):
  ("  " * d) + "\(.type) \"\(.name)\" "
  + (if .absoluteBoundingBox then "[\(.absoluteBoundingBox.x | floor),\(.absoluteBoundingBox.y | floor) \(.absoluteBoundingBox.width | floor)x\(.absoluteBoundingBox.height | floor)]" else "" end)
  + (if .layoutMode then " layout=\(.layoutMode) gap=\(.itemSpacing // 0) pad=\(.paddingTop // 0),\(.paddingRight // 0),\(.paddingBottom // 0),\(.paddingLeft // 0)" else "" end)
  + (((.fills // []) | map(select(.type == "SOLID" and .visible != false))) as $f | if ($f | length) > 0 then " fill=" + ($f[0].color | hex) else "" end)
  + (if (.strokes // []) | length > 0 then " stroke=" + (.strokes[0].color | hex) + "/\(.strokeWeight // "")" + (if .individualStrokeWeights then " sides=\(.individualStrokeWeights | tostring)" else "" end) else "" end)
  + (if .cornerRadius then " r=\(.cornerRadius)" else "" end)
  + (if .type == "TEXT" then " text=\(.characters | @json) font=\(.style.fontFamily) \(.style.fontSize)/\(.style.fontWeight) lh=\(.style.lineHeightPx | floor)" else "" end)
  + (if .componentId then " comp=\(.componentId)" else "" end)
  + (if .visible == false then " HIDDEN" else "" end);

# 숨김 노드는 자식까지 건너뛴다. 인스턴스 내부는 4단계까지만 펼친다
def walk(d): line(d), (if .visible == false or (.type == "INSTANCE" and d > 3) then empty else (.children // [] | .[] | walk(d + 1)) end);

.nodes[].document | find($id) | walk(0)
