---
layout: single
title:  "[논문 리뷰] SlowFast Networks for Video Recognition"
toc: true
toc_sticky: true

last_modified_at: 2024-07-22 17:51:52 +0900
date:   2024-07-22 17:51:52 +0900

categories: 
- video
tags: 
- [paper, video]
---
## 1. Introduction

spatial information과 temporal information은 서로 symmetrical하지 않으니 둘을 따로 생각하는 것으로부터 시작한다. spatial inforamtion은 느리게 나타난다. 예를 들어 손을 흔든다고 해서 손이라는 물체의 identity가 바뀌는 것은 아니다. 반대로 motion은 훨씬 빠르게 일어난다(ex. clapping, waving, shakong, walking, …). 이런 직관에 기반해 two-pathway slowfast model을 설계했다. Slow path에서는 semantic information을 포착하고 Fast pathway에서는 빠르게 변하는 motion을 포착하도록 설계한다. Fast pathway는 channel 수를 줄이고 spatial information을 덜 포착하도록 설계해 연산량을 전체의 20% 정도로 설계했다. 이 두 pathway를 lateral connections를 이용해 합친다. 이런 구조는 인체의 시각system에 대한 생물학적 study에서 영감을 받은 것이다. retinal ganglion cell의 80%는 P-cell, 20%는 M-cell로 구성되어있는데 M-cell이 fast temporal change에 반응을 하고 P-cell이 spatial detail이나 색에 반응한다는 것에서 Slow pathway는 P-cell을, Fast pathway는 M-cell을 모방해서 설계했다는 것을 알 수 있다.

## 2. Related Work

### Optical flow for video recognition

optial flow는 deep learning 이전에 물체의 이동을 표현하는 하나의 수단으로 사용되었던 방법인데 사진에서 빛의 이동을 통해 물체의 이동을 감지하는 방식이다. 빛의 변화만을 이용해 이동을 탐지하기 때문에 Aperture Problem등의 한계가 있다. 

## 3. SlowFast Networks

![fig1](https://github.com/user-attachments/assets/4584b402-e013-4d81-9855-bee346c2b568)

### 3.1 Slow pathway

key concept: temporal stride $\tau$

$\tau$ frame 중에 하나만 골라서 processing 진행(e.g. $\tau$=16이고 30-fps video라면 1초에 2frame만 sampling되는 것)

 slow pathway로 sampling되는 frame 수가 T라면 raw clip length = T x $\tau$

### 3.2 Fast pathway

같은 raw clip으로부터 2가지 frame rate로 정보를 추출해내는 것이다.

$\tau/\alpha$라는 작은 temporal stride를 사용, $\alpha$: slow pathway와의 frame rate 비율

→ $\alpha T$ frame을 sampling (실험적으로 $\alpha$=8로 설정)

temporal fidelity를 최대한 유지하기 위해 classification layer 전까지는 downsampling 전혀x fast pathway에서 feature tensor는 계속 $\alpha T$ frame

slow pathway보다 $\beta$만큼의 channel을 가지고 typical value는 1/8이다. 채널 수를 적게 설정함으로써 전체의 20% 정도 computation만 하도록 설계했다. 여기서는 spatial한 성질이 더 필요가 없으니 input spatial resolution을 줄이거나 색 정보를 제거하는 등의 실험도 진행했고 모두 다 accuracy가 괜찮았다. 

### 3.3 Lateral connections

lateral connection은 image object detection에서 서로 다른 level의 공간 resolution과 semantic을 합칠 때 이용한다(FPN 등). SlowFast net에서는 lateral connection이 매 stage마다 일어난다. 둘은 temporal dimension이 다르기 때문에 3.4의 과정을 거쳐 차원을 맞추는 과정을 통해 합쳐지고 이는 Fast pathway → Slow pathway의 unidirection으로 이루어진다. bidirection으로 해도 비슷한 결과가 나왔다고 한다. 

각 pathway의 output에서 global average pooling을 진행하고 두 feature vector을 concatenate해 FCN(classifier layer)에 넣는다.

### 3.4 Instantiations

![tab1](https://github.com/user-attachments/assets/4f1f5eb2-3ec9-4890-a381-bdb3f781c8a3)

 slow pathway에는 temporally strided 3D ResNet을 이용

non-degenerate temporal convolutions를 이용했는데 모델의 초반부에는 그냥 2D convolution을 이용하다가(~res_3) res_4, res_5에만 3D temporal convolution을 적용했다고 한다. 실험적으로 모델 초반부에 temporal convolution을 사용하면 spatial 특징이 지배적인 곳에서 spatial 특성을 잡아내지 못하기 때문이라고 추측하고 있다. 

Fast pathway에는 모든 layer에 temporal convolution을 이용했다. 앞서 얘기했던 것처럼 downsampling layer는 존재하지 않는다.

Lateral connections detail

feature shape of slow pathway: $\{T, S^2, C\}$

feature shape of fast pathway: $\{\alpha T, S^2, \beta C\}$

1. Time-to-channel: 모든 $\alpha$ frame을 한 프레임의 channel로 이동
    
    $\\{\alpha T, S^2, \beta C\\}$ → $\\{T, S^2, \alpha \beta C\\}$ 
    
2. Time-strided sampling: 매 $\alpha$ frame마다 하나씩 sampling
    
    $\\{\alpha T, S^2, \beta C\\}$ → $\\{T, S^2, \beta C\\}$
    
3. Time-strided convolution: 5x1^2 kernal, $2\beta C$ output channels, stride=$\alpha$인 3D convolution 수행
