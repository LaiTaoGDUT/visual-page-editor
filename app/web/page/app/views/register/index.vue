<template>
  <div class="login">
    <div class="login-header">
      <a-page-header
        style="
          border: 1px solid rgb(235, 237, 240);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
        "
        title="V E"
        sub-title="可视化网页搭建平台"
        :backIcon="false"
      >
        <template slot="extra">
          <div class="pages-header-info">
            <a @click="$router.push('/login')">登录</a>
          </div>
        </template>
      </a-page-header>
    </div>
    <div class="login-content">
      <div class="login-content-title">邮箱注册</div>
      <a-form :form="form" class="login-content-form" @submit="handleSubmit">
        <a-form-item
            :validateStatus="validEmail"
            :help="helpEmail"
            :hasFeedback="feedbackEmail"
        >
          <a-input
            placeholder="邮箱"
            v-model="email"
            @change="validaingEmail"
          >
            <a-icon
              slot="prefix"
              type="mail"
              style="color: rgba(0, 0, 0, 0.25)"
            />
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input
            v-decorator="[
              'username',
              {
                rules: [{ min: 1, max: 16, message: '用户名长度在1-16个字符之间！' }],
              },
            ]"
            placeholder="用户名"
          >
            <a-icon
              slot="prefix"
              type="user"
              style="color: rgba(0, 0, 0, 0.25)"
            />
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input-password
            v-decorator="[
              'password',
              {
                rules: [{ min: 6, max: 16, message: '密码长度在6-32个字符之间！' }],
              },
            ]"
            type="password"
            placeholder="密码"
          >
            <a-icon
              slot="prefix"
              type="lock"
              style="color: rgba(0, 0, 0, 0.25)"
            />
          </a-input-password>
        </a-form-item>
        <a-form-item
            :validateStatus="validPassAgain"
            :help="helpPassAgain"
        >
          <a-input-password
            type="password"
            placeholder="确认密码"
            @change="validaingPassAgain"
            v-model="passwordAgain"
          >
            <a-icon
              slot="prefix"
              type="lock"
              style="color: rgba(0, 0, 0, 0.25)"
            />
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a class="login-content-form-forgot" @click="$router.push('/login')"> 已有账号？ </a>
          <a-button type="primary" html-type="submit" class="login-form-button">
            立即注册
          </a-button>
          Or
          <a @click="$router.push('/login')"> 去登录 </a>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>
import { checkEmailRepeat, register } from "@/services/users";
import { mapMutations } from 'vuex';
export default {
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: "normal_login" });
  },
  data() {
      return {
          validPassAgain: 'success',
          helpPassAgain: '',
          validEmail: 'success',
          helpEmail: '',
          feedbackEmail: false,
          email: '',
          passwordAgain: ''
      }
  },
  methods: {
    ...mapMutations('user', ['setInfo']),
    async validaingEmail() {
        if (!this.email) {
            this.validEmail = 'error';
            this.helpEmail = '邮箱不能为空！';
            return false;
        }
        this.feedbackEmail = true;
        this.validEmail = 'validating';
        const res = await checkEmailRepeat(this.email);
        this.feedbackEmail = false;
        if (res.code === 303) {
            this.validEmail = 'error';
            this.helpEmail = '该邮箱已被注册';
            return false;
        } else {
            this.validEmail = 'success';
            this.helpEmail = '';
            return true;
        }
    },
    validaingPassAgain() {
        if (this.passwordAgain !== this.form.getFieldValue('password')) {
            this.validPassAgain = 'error';
            this.helpPassAgain = '二次密码不匹配';
            return false;
        } else {
            this.validPassAgain = 'success';
            this.helpPassAgain = '';
            return true;
        }
    },
    handleSubmit(e) {
      e.preventDefault();      
      this.form.validateFields(async (err, values) => {
        if (!err) {
            if (await this.validaingEmail() && this.validaingPassAgain()) {
                this.register(values);
            }
        }
      });
    },
    async register(values) {
      this.$message.success('注册成功');
      return;
      const res = await register(this.email, values.username, values.password);
      if (res.code === 200) {
        this.$message.success('注册成功');
        this.form.resetFields();
        this.email = '';
        this.passwordAgain = '';
      }
    },
  },
};
</script>

<style lang="less" scoped>
.login {
  &-header {
    /deep/.ant-page-header-heading-title {
      font-size: 28px;
    }
  }
  &-content {
    margin: 10% auto 15%;
    padding: 32px;
    box-sizing: border-box;
    background: #ffffff;
    box-shadow: 0px 9px 60px 0px rgba(93, 122, 138, 0.2);
    border-radius: 8px;
    width: 400px;

    &-title {
      color: #333;
      font-size: 24px;
      margin-bottom: 16px;
      text-align: center;
    }

    &-form {
      &-forgot {
        float: right;
      }
      .login-form-button {
        width: 100%;
        background-color: #41b883;
        border-color: #41b883;
      }
      /deep/.ant-input {
        height: 40px;
        background-color: #f5f5fa;
      }
      /deep/.ant-btn {
        height: 40px;
      }
    }
  }
}
</style>