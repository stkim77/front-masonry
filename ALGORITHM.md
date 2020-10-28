# Dynamic Grid List 구현 방식
1. 아이템을 배치할 리스트를 좌측에서 우측 순서로 array를 구성후
2. array 0번째부터 리스트의 높이를 계산하여 가장 길이가 긴 리스트 찾아서 아이템을 배치하도록 하였습니다.
3. 리스트의 빈공간이 화면에 보이는 경우에만 해당 리스트에 아이템 배치를 하기 위하여, 리스트 아래에 emtpy 영역을 만들어 해당 영역에 intersectionobserver 이벤트를 사용하여 아이템 추가 여부를 판단 할수 있돌록 하였습니다. 

```js
// sudo code
let result = null;
for (let i = 1 ; i<list.length ; i++) {
  if (list[i].available) {
    if (!result) {
      result = list[i];
    } else {
      if (result.height > list[i].height) {
        result = list[i];
      }
    }
  }
}
```
