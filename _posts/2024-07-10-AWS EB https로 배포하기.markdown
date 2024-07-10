---
layout: single
title:  "AWS EB https로 배포하기"
date:   2024-07-10 15:03:52 +0900
categories: aws
tags: [aws, backend, nodejs]
---
# 서론
aws에 https로 배포하기를 매번 찾아보기 귀찮아서 이 글을 작성해봅니다. 이 글은 AWS Elsatic Beanstalk 기준으로 작성되었음을 알려드립니다. 왜 이런 식으로 하는지는 저도 잘 모르고 그냥 과정만 정리했으니 참고부탁드립니다. Nodejs 백엔드가 이미 EB에 업로드 되어 있다는 전제 하에 작성된 글입니다.
<br> 참고링크: [EC2 https로 연결하기](https://velog.io/@server30sopt/EC2-HTTPS%EB%A1%9C-%EC%97%B0%EA%B2%B0%ED%95%98%EA%B8%B0)

# 진행과정
1. 도메인 구매하기([가비아](https://www.gabia.com/))
2. AWS route53에서 구매한 도메인 등록 및 연결
3. ACM 인증서 요청 및 승인
4. 대상 그룹 생성
5. 로드밸런서 생성
6. 도메인에 로드밸런서 등록 및 대상 그룹에 EB 연결
   
## 1. 도메인 구매하기
내도메인 한국이라는 무료 도메인 사이트를 이용해보려고 했는데 여기서는 네임서버 관리를 할 수 없어서 포기하고 가비아 도메인을 구매했다. 가장 싼 1년에 1900원인 .site 도메인으로 구매했다.
![1.도메인 준비](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/5418ecf4-8255-4d3b-99de-16a8c33f1da4)

## 2. AWS route53에서 구매한 도메인 등록 및 연결
가비아에서 구매한 도메인을 AWS route53에 등록해줘야 한다. 아마도 등록을 해야 ACM에서 인증서를 발급받을 수 있는 것으로 보인다.
<br><br>
Route53에서 호스팅영역 생성을 클릭 후 도메인 명에 등록하고자 하는 아까 구매한 도메인을 등록한다.

![2.AWS route53에서 구매한 도메인 등록 및 연결](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/3faef93e-8c58-4b98-8551-262dd98c1ee5)

<br>
생성된 호스팅 영역에서 새 레코드를 생성해 값 부분에 연결하고자하는 EC2(또는 EB의 EC2)의 퍼블릭 IP를 적는다. 퍼블릭 ip의 경우 EC2 - 인스턴스 - 퍼블릭 IPV4에서 확인할 수 있다.

![3.레코드 생성 및 ec2 퍼블릭 ip 연결](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/de48877d-3f0c-4a6d-a5a7-900b83c4a6af)

<br>
레코드 중 NS를 클릭하면 해당 호스팅 영역의 네임서버를 알 수 있는데 이를 가비아 홈페이지의 네임서버에 등록하면 된다. 이떄 주소 끝의 온점은 빼고 적어야한다.

![4.도메인 네임서버 설정](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/bfcb091a-a613-4eb8-ba22-97756131c143)

![4.도메인 네임서버 설정](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/a65af4cb-277a-411b-b5a4-1918d7f8ced9)


## 3. ACM 인증서 요청 및 승인
도메인과 route53을 연결하였다면 이제 ACM(AWS Certificate Manager)에서 인증서를 발급받을 차례이다. ACM으로 이동해서 인증서 요청을 클릭한다.
![5.acm 설정](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/68fb2060-e605-44d6-9ac2-e418af982a5b)

<br>
구매한 도메인을 도메인 이름에 적고 요청한다.

![5.acm 설정](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/0de31cf2-ddc8-4fc1-8387-c213cf419430)

<br>
완료하면 검증 대기 중인 도메인이 뜨게 되는데 우측 상단 Route53에서 레코드 생성을 누르게 되면 잠시 후 상태가 발급됨으로 바뀐다.

![6.route53에서 레코드 생성](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/a5a80c1f-67d2-4d09-9c3b-aab91b9b5307)

![7.인증서 발급 완료](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/fef9a005-0f0f-48ec-89d4-9b387cf33363)

## 4. 대상그룹(Target Group) 생성
이제 EC2 - 대상그룹으로 이동해 대상그룹 생성을 클릭한다.

![8.대상 그룹 생성](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/22250152-cc7b-4ce7-bff1-a87d7c513637)

<br>

대상 유형은 인스턴스로 선택하고 대상 그룹 이름은 아무거나 하고 나머지 설정은 안 건드려도 된다.

![8.대상 그룹 생성](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/bfc7fffe-8a7c-48a7-8435-d9cd1eb36441)

<br>
상태검사는 그냥 루트경로(/)로 설정해도 괜찮은데 루트 경로에서 200 response가 안오면 EB에서 상태를 severe로 바꿔버리니 200 response가 오는 경로로 설정하기를 바란다.

![8.대상 그룹 생성](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/73efad09-544a-4774-9a6d-2ae6a7e23632)

<br>
연결하고자 하는 ec2 인스턴스를 등록한다. 아래에 보류 중인 것으로 포함을 눌러서 등록을 하면 된다. 분명히 이렇게 등록했는데 배포 이후 일정 시간 후에 503 Service Temporarily Unavailable가 떠서 봤더니 대상 그룹에 등록된 대상이 없어서 생기는 문제였다. 그러니 보류 중 등록 말고 그냥 등록하도록 하자.

[참고링크](https://samtao.tistory.com/56)

![8.대상 그룹 생성](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/6705e9a4-b24a-4475-a731-b7eb714c5674)

## 5. 로드밸런서 생성
다음으로 EC2 - 로드밸런서로 가서 가장 왼쪽의 Application Load Balancer을 생성한다.
![9.로드밸런서 생성](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/5ca86cc5-bf8f-463d-b361-2dd362e5e6eb)

<br>

로드밸런서 이름은 아무거나 하면 되고 나머지 설정은 건드릴 필요 없다. 네트워크 매핑은 귀찮아서 다 넣었는데 이 부분은 다 선택하는 것이 좋아보인다.
![9.로드밸런서 생성](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/355cef8c-f0d1-4f8b-9620-310bfcc2aceb)
![9.로드밸런서 생성](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/1673d5e3-1621-4287-a16f-e49fd73b6725)

<br>
리스너는 기본적으로 HTTP 80이 들어가 있고 HTTPS를 리스너로 추가해주면 된다. 오른쪽에는 아까 생성한 대상 그룹을 매핑해주면 된다.

![9.로드밸런서 생성](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/ddcc86a0-88cf-42ab-8b4e-5f1e12712837)

<br>
보안 그룹의 경우 AWS EB를 만들 때 만지는 부분이긴 한데 RDSDB말고 EB Security만 추가해줘도 될 것이다. EB Security의 인바운드 규칙에도 HTTPS를 추가하면 된다.

![9.로드밸런서 생성](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/9cf7706d-6a3e-447b-b80e-046f0b5dc756)
![9.로드밸런서 생성](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/81a467f4-a482-471a-9ed2-6da1b83ecfb8)

## 6. 도메인에 로드밸런서 등록
Route53으로 돌아와서 아까 등록했던 호스팅 영역에 레코드 편집을 누른다. 별칭 스위치를 클릭하고 트래픽 라우팅 대상에 아까 만든 로드밸런서를 등록한다. 

![10.Route53에 로드밸런서 등록](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/8edb9b2c-b4d1-467f-8d32-7f2f3c606378)

<br>

추가적으로 www.~을 subdomain으로 등록하고 싶다면 추가로 레코드를 생성해서 로드밸런서를 등록하면 된다.

![11.www 등록](https://github.com/Nugu-ai/Nugu-ai.github.io/assets/84832167/541b2934-6efb-4f27-b68a-05eb7e1bea16)







