<template>
    <div class="container">
        <div class="header">
            <van-icon @click="goBack" name="arrow-left" class="header-left" size="30" />
            填写服务订单
        </div>
        <status-bar item="0" /> 
        <van-cell class="cell">
          <template #title>
              <van-image
                width="25"
                height="25"
                :src="createInfo.service.serviceImg"
              />
              <span class="server-name">{{ createInfo.service.serviceName }}</span>
          </template>
          <template #default>
            <div class="service-text">服务内容</div>
          </template>
        </van-cell>
        <van-cell-group class="cell">
          <van-cell>
            <template #title>就诊医院</template>
            <template #default>
              <div @click="showHospital=true">
                {{ form.hospital_name || '请选择就诊医院' }}
                <van-icon name="arrow" />
              </div>
            </template>
          </van-cell>
          <van-cell>
            <template #title>就诊时间</template>
            <template #default>
              <div @click="showStartTime=true">
                {{ currentDate || '请选择就诊时间' }}
                <van-icon name="arrow" />
              </div>
            </template>
          </van-cell>
          <van-cell>
            <template #title>陪诊师</template>
            <template #default>
              <div @click="showComponion=true">
                {{ componionName || '请选择陪护师' }}
                <van-icon name="arrow" />
              </div>
            </template>
          </van-cell>

          <van-cell>
            <template #title>接送地址</template>
            <template #default>
              <van-field
                class="text"
                input-align="right"
                v-model="form.receiveAddress"
                placeholder="请填写接送地址"
              />
            </template>
          </van-cell>

          <van-cell>
            <template #title>联系电话</template>
            <template #default>
              <van-field
                class="text"
                input-align="right"
                v-model="form.tel"
                placeholder="请填写联系电话"
              />
            </template>
          </van-cell>
        </van-cell-group>

        <van-cell-group title="服务需求" class="cell">
          <van-field
            class="text"
            style="height: 100px;"
            v-model="form.demand"
            placeholder="请简单描述您要就诊的科室.."
          />
        </van-cell-group>

        <van-button @click="submit" class="sumbit" type="primary" size="large">提交订单</van-button>

        <van-popup
          v-model:show="showHospital"
          position="bottom"
          :style="{ height: '30%' }"
        >
          <van-picker
            :columns="showHospColumns"
            @confirm="showHospConfirm"
            @cancel="showHospital = false"
          />
        </van-popup>

        <van-popup
          v-model:show="showStartTime"
          position="bottom"
          :style="{ height: '30%' }"
        >
          <van-date-picker
            @confirm="showTimeConfirm"
            @cancel="showStartTime = false"
            title="选择日期"
            :min-date="minDate"
          />
        </van-popup>

        <van-popup
          v-model:show="showComponion"
          position="bottom"
          :style="{ height: '30%' }"
        >
          <van-picker
            :columns="componionColumns"
            @confirm="showComponionConfirm"
            @cancel="showComponion = false"
          />
        </van-popup>
        <!-- 支付二维码弹窗 -->
        <van-dialog :show-confirm-button="false" v-model:show="showCode">
            <van-icon name="cross" class="close" @click="closeCode" />
            <div>微信支付</div>
            <van-image width="150" height="150" :src="codeImg" />
            <div>请使用本人微信扫描二维码</div>
        </van-dialog>


    </div>
</template>
<script setup>
import { onMounted, getCurrentInstance, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import StatusBar from '../../components/statusBar.vue'
import Qrcode from 'qrcode'
//获取当前vue实例
const { proxy } = getCurrentInstance()

const createInfo = reactive({
    companion: [],
    hospitals: [],
    service: {}
})

onMounted(async () => {
    const { data } = await proxy.$api.h5Companion()
    Object.assign(createInfo, data.data)
    console.log(createInfo)
})

const router = useRouter()
//点击返回
const goBack = () => {
    router.go(-1)
}

//form数据
const form = reactive({})

//就诊医院
const showHospital = ref(false)

const showHospColumns = computed(() => {
    return createInfo.hospitals.map(item => {
        return { text: item.name, value: item.id }
    })  
})



//选择医院
const showHospConfirm = (item) => {
    form.hospital_id = item.selectedOptions[0].value
    form.hospital_name = item.selectedOptions[0].text
    //关闭弹出层
    showHospital.value = false
}

//选择就诊时间
const showStartTime = ref(false)
const currentDate = ref()
//最小日期
const minDate = ref(new Date())
const showTimeConfirm = (item) => {
    const dateStr = item.selectedValues.join('-')
    currentDate.value = dateStr
    form.starttime = new Date(dateStr).getTime()
    showStartTime.value = false
}
//选择陪诊师
const showComponion = ref(false)
const componionColumns = computed(() => {
    return createInfo.companion.map(item => {
        return { text: item.name, value: item.id }
    })  
})
const componionName = ref()
const showComponionConfirm = (item) => {
  form.companion_id = item.selectedOptions[0].value
  componionName.value = item.selectedOptions[0].text
  showComponion.value = false
}
//支付二维码弹窗
const showCode = ref(false)
const codeImg = ref('')
const closeCode = () => {
  showCode.value = false
  router.push('/order')
}
//提交表单
const submit = async () => {
  const params = [
    'hospital_id',
    'hospital_name',
    'demand',
    'companion_id',
    'receiveAddress',
    'tel',
    'starttime'
  ]
  for (const i of params) {
    if (!form[i]) {
      showNotify({ message: '请把每一项都填写'});
      return
    }
  }
  const { data: orderRes } = await proxy.$api.createOrder(form)
  Qrcode.toDataURL(orderRes.data.wx_code).then((url) => {
    showCode.value = true
    codeImg.value = url
  })

}

</script>
<style lang="less" scoped>
.container {
    background-color: #f0f0f0;
    height: 100vh;
  }
  .header {
    background-color: #fff;
    line-height: 40px;
    text-align: center;
  }
  .van-row {
    background-color: #fff;
    padding: 10px;
    margin: 5px;
    border-radius: 5px;
    .text1 {
      font-size: 16px;
      line-height: 25px;
      font-weight: bold;
    }
    .text2 {
      font-size: 14px;
      line-height: 20px;
      color: #999999;
    }
  }
  .bottom-text {
    line-height: 50px;
    text-align: center;
    color: #999999;
  } 
</style>