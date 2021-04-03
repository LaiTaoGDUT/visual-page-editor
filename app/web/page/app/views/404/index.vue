<template>
  <a-result status="404" title="404" sub-title="该页面不存在。">
    <template #extra>
      <a-button type="primary" @click="$router.replace('/')">
        回到首页
      </a-button>
    </template>
  </a-result>
</template>

<script>
export default {

}
</script>

<style>

</style>