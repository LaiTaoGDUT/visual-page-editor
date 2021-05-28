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
            <a @click="$router.push('/register')">注册</a>
          </div>
        </template>
      </a-page-header>
    </div>
    <div class="login-content">
      <div class="login-content-title">邮箱登录</div>
      <a-form :form="form" class="login-content-form" @submit="handleSubmit">
        <a-form-item>
          <a-input
            v-decorator="[
              'email',
              {
                rules: [{ required: true, message: '请输入您的邮箱！' }],
              },
            ]"
            placeholder="邮箱"
          >
            <a-icon
              slot="prefix"
              type="mail"
              style="color: rgba(0, 0, 0, 0.25)"
            />
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input-password
            v-decorator="[
              'password',
              {
                rules: [{ required: true, message: '请输入您的密码！' }],
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
        <a-form-item>
          <a-checkbox
            v-decorator="[
              'remember',
              {
                valuePropName: 'checked',
                initialValue: true,
              },
            ]"
          >
            记住我
          </a-checkbox>
          <a class="login-content-form-forgot" href=""> 忘记密码？ </a>
          <a-button type="primary" html-type="submit" class="login-form-button">
            立即登录
          </a-button>
          Or
          <a @click="$router.push('/register')"> 去注册 </a>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>
import { login } from "@/services/users";
import { mapMutations } from 'vuex';
export default {
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: "normal_login" });
  },
  methods: {
    ...mapMutations('user', ['setInfo']),
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.login(values);
        }
      });
    },
    async login(values) {
      const res = await login(values.email, values.password);
      if (res.code === 300) {
        this.setInfo(res.data);
        this.$message.success('登陆成功！');
        this.$router.push('/');
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