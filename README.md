# Download

支持断点续传，前置条件

提供的 ``url`` 需要支持指定 Range 进行下载(按分片下载)。 

## 参数

* url : 下载地址
* fileName : 保存的文件名
* signal: 取消下载
* start: 开始下载
* pause: 暂停
* onInitFinished: 数据初始化完成，才可以点击下载
* onChangeStatus: pause、downloading、finished
* onProgress： 下载进度 已经下载chunk数/总chunk数
* onError ： 下载错误




## IndexDB

* version 是数据库版本，这个是为了兼容和升级吗？ 是的
