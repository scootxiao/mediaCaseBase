<template>
    <div class="login-container">
          <div class="login-wrap">
              <div class="ms-login" >
                  <p>用户登录</p>
                  <el-form :model="ruleForm"  ref="ruleForm" label-width="0px" class="demo-ruleForm">
                      <el-form-item prop="username">
                          <el-input v-model="ruleForm.username" placeholder="请输入用户名">
                            <i slot="prefix" class="el-input__icon iconfont icon-yonghu2"></i>
                          </el-input>
                      </el-form-item>
                      <el-form-item prop="password">
  
                          <el-input type="password" placeholder="请输入密码" v-model="ruleForm.password" >
                            <i slot="prefix" class="el-input__icon iconfont icon-quanxian2"></i>
                          </el-input>
                      </el-form-item>
                      <el-form-item prop="cacode">
                            <el-input style="width:150px;" placeholder="请输入验证码" v-model="ruleForm.cacode" @keyup.enter.native="submitForm('ruleForm')">
                              <i slot="prefix" class="el-input__icon iconfont icon-securityCode-b"></i>
                              <!-- <template slot="prepend"><img :src="caImg" style="cursor:pointer;height:25px;"  class='ca-image' @click="getCaImgae()" alt='服务器挂了' /></template> -->
                            </el-input>
                            <div class="cacode-div"><img :src="caImg" style="cursor:pointer;height:25px;"  class='ca-image' @click="getCaImgae()" alt='服务器挂了' /></div>
                      </el-form-item>
                      <p class="login-error">{{login_error}}</p>
                      <div class="login-btn">
                          <el-button type="primary" @click="submitForm('ruleForm')">立即登录</el-button>
                      </div>
                      <el-checkbox v-model="rememberPassword">记住密码（2周）</el-checkbox>
                  </el-form>
              </div>
          </div>

    </div>
</template>

<script>
import axios from 'axios'
// import { encodeAES, decodeAES } from '@/utils/md5'
import CryptoJS from 'crypto-js'
import {  getCaptchaCode, login} from '@/api/index.js'
axios.defaults.headers.Authorization=''
axios.defaults.withCredentials=true
export default {
    data: function(){
        return {
            ruleForm: {
                username: 'super',
                password: '123456',
                cacode: ''
            },
            caImg: '',
            rememberPassword: false,
            login_error:'',
        }
    },
    methods: {
      //DES加密 Pkcs7填充方式
      encryptByDES(message, key){
        const keyHex = CryptoJS.enc.Utf8.parse(key);
        const encrypted = CryptoJS.DES.encrypt(message, keyHex, {
         mode: CryptoJS.mode.ECB,
         padding: CryptoJS.pad.Pkcs7
         });
        return encrypted.toString();
      },
      //DES解密
      decryptByDES(ciphertext, key){
        const keyHex = CryptoJS.enc.Utf8.parse(key);
        // direct decrypt ciphertext
        const decrypted = CryptoJS.DES.decrypt({
           ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
         }, keyHex, {
           mode: CryptoJS.mode.ECB,
           padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
      },
      submitForm(formName) {
           axios.get('http://localhost:8087/api/v1/login/generate/param' + '?' + Date.parse(new Date()),{
               params:{

               },
               headers: {
                 'Authorization': ''
               }
             }).then(response=>{

              console.log("--response:",response)

                this.key=response.data
  
                 axios.post('http://localhost:8087/api/v1/ubc/login', {
                   postUsername: this.encryptByDES(this.loginForm.username,this.key),
                   postPassword: this.encryptByDES(this.loginForm.password,this.key),
                   captchaCode: this.loginForm.code
                 },{
                   headers: {
                     'Authorization': ''
                   }
                 })
                 .then(function (response){
                    console.log("操作成功 response:",response)
                 })
                 .catch(function (error) {
                    console.log(error)
                 })



             }).catch(function (error) {
               console.log("param error:",error)
             })

        },
        getCaImgae (){
           this.caImg = 'http://localhost:8087/api/v1/login/captchaCode' + '?' + Date.parse(new Date())
        },
    },
    mounted(){
      this.getCaImgae()
    }

}
</script>

<style scoped>
    .login-container{
      width:100%;
      height:100%;
    }
    .login-wrap{
        width:100%;
        height:100%;
        /* background-image: url(/static/img/main/login_body_bg.jpg); */
        background-size: 100% 100%;
        position: relative;
    }
    .login-top{
      width: 100%;
      height: 100px;
      line-height: 100px;
      padding-left: 100px;
      background: #fff;
    }
    .login-top img{
      width:180px;
      height:auto;
      margin-right:10px;
      float:left;
      margin-top: 20px;
    }
    .login-top span{
      color:#39588f;
      font-weight: bold;
      font-size:30px;
      display: block;
      float:left;
      margin-top: 7px;
    }
    .login-bottom{
      position: absolute;
      left:0px;
      bottom:0px;
      width:100%;
      color:#fff;
      padding-bottom:20px;
      background: #fff;
      padding-top:20px
    }
    .login-bottom p{
      width: 100%;
      text-align: center;
      margin-bottom:3px;
      color:#6c6c6c;
      font-size:14px;
    }
    .cacode-div{
      position:absolute;
      right:0px;
      bottom:0px;
      width:100px;
      height:30px;
      border:1px solid #dcdfe6;
      border-radius:3px;
    }
    .login-error{
      color:#f00;
      font-size:14px;
    }
    .ms-login{
        position: absolute;
        left:75%;
        top:50%;
        width:270px;
        height:300px;
        margin:-160px 0 0 -190px;
        padding:40px;
        border-radius: 5px;
        background: #fff;
        padding-top:15px;
        padding-bottom:15px;
        -webkit-box-shadow: rgba(0,0,0,0.6) 0px 0px 20px;
        -moz-box-shadow: rgba(0,0,0,0.6) 0px 0px 20px;
        box-shadow: rgba(0,0,0,0.6) 0px 0px 20px;
    }
    .ms-login>p{
      font-size:16px;
      margin-bottom:20px;
      font-weight: bold;
    }
    .login-btn .el-button--primary{
        text-align: center;
        background: -webkit-linear-gradient(left, #5851d5 , #347aec); /* Safari 5.1 - 6.0 */
        background: -o-linear-gradient(right, #5851d5 , #347aec); /* Opera 11.1 - 12.0 */
        background: -moz-linear-gradient(right, #5851d5 , #347aec); /* Firefox 3.6 - 15 */
        background: linear-gradient(to right, #5851d5 , #347aec); /* 标准的语法 */
    }
    .login-btn button{
        width:100%;
        height:36px;
        font-size:16px;
        margin:10px 0 14px 0;
    }
    .el-input-group__prepend{
      width: 160px;
    }
    .ca-image{
      width: 100px;
    }
    .forget-password{
      float:right;
      font-size:14px;
      color:#606266;
      cursor:pointer;
    }
    .forget-password:hover{
      color:#409EFF;
    }
    .forget-container{
      width:100%;
      height:100%;
      background: #f6f6f6;
    }
    .forget-title{
      height:80px;
      line-height:80px;
      background: #fff;
      padding:0 40px;
      border-bottom:solid 1px #dddee1;
    }
    .forget-title img{
      float:left;
      width:160px;
      height: auto;
      margin-right: 10px;
      margin-top:7px;
    }
    .forget-title span:nth-of-type(1){
      float:left;
      display:block;
      margin-top:5px;
      font-size:16px;
      font-weight:bold;
    }
    .forget-title button{
      float:right;
      margin-top:24px;
    }
    .steps-all{
      padding:0 30%;
      margin:60px 0 40px 0;
    }
    .authenticationForm{
      width: 380px;
      position: absolute;
      left: 50%;
      top: 50%;
      margin-left: -200px;
      margin-top: -90px;
    }
    .authenticationForm-container{
        width:50%;
        margin-left:auto;
        margin-right:auto;
        margin-top:50px;
        background: #fff;
        border:solid 1px #dddee1;
        padding:60px 40px;
        position: relative;
        height:200px;
    }
    .passwordSetForm{
      width: 380px;
      position: absolute;
      left: 50%;
      top: 50%;
      margin-left: -220px;
      margin-top: -90px;
    }
    .passwordSetForm-container{
      width:50%;
      margin-left:auto;
      margin-right:auto;
      margin-top:50px;
      background: #fff;
      border:solid 1px #dddee1;
      padding:60px 40px;
      position: relative;
      height:200px;
    }
    .password-success{
      text-align:center;
      width:100%;
      font-size:16px;
    }

</style>
