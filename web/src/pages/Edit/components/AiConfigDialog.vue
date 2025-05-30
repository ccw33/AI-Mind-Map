<template>
  <el-dialog
    class="aiConfigDialog"
    :title="$t('ai.AIConfiguration')"
    :visible.sync="aiConfigDialogVisible"
    width="600px"
    append-to-body
  >
    <div class="aiConfigBox">
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleFormRef"
        label-width="120px"
        size="small"
      >
        <!-- AI提供商选择 -->
        <el-form-item label="AI提供商" prop="provider">
          <el-select
            v-model="ruleForm.provider"
            placeholder="请选择AI提供商"
            @change="onProviderChange"
            style="width: 100%"
          >
            <el-option
              v-for="(config, key) in providerConfigs"
              :key="key"
              :label="config.name"
              :value="key"
            >
              <span>{{ config.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 12px">
                {{ config.requiresApiKey ? '需要API Key' : '本地服务' }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- API Key -->
        <el-form-item
          v-if="currentProviderConfig.requiresApiKey"
          label="API Key"
          prop="apiKey"
        >
          <el-input
            v-model="ruleForm.apiKey"
            placeholder="请输入API Key"
            type="password"
            show-password
          />
          <div class="form-tip">
            请在 {{ currentProviderConfig.name }} 官网获取API Key
          </div>
        </el-form-item>

        <!-- 基础URL -->
        <el-form-item label="基础URL" prop="baseURL">
          <el-input
            v-model="ruleForm.baseURL"
            placeholder="API基础URL"
          />
          <div class="form-tip">
            默认：{{ currentProviderConfig.baseURL }}
          </div>
        </el-form-item>

        <!-- 模型选择 -->
        <el-form-item label="模型" prop="model">
          <el-select
            v-model="ruleForm.model"
            placeholder="请选择模型"
            style="width: 100%"
          >
            <el-option
              v-for="model in currentProviderConfig.models"
              :key="model"
              :label="model"
              :value="model"
            />
          </el-select>
        </el-form-item>

        <!-- 高级设置 -->
        <el-collapse v-model="activeCollapse">
          <el-collapse-item title="高级设置" name="advanced">
            <el-form-item label="请求超时" prop="timeout">
              <el-input-number
                v-model="ruleForm.timeout"
                :min="5000"
                :max="120000"
                :step="1000"
                style="width: 100%"
              />
              <div class="form-tip">单位：毫秒，建议30000</div>
            </el-form-item>

            <el-form-item label="调试模式" prop="debugMode">
              <el-switch v-model="ruleForm.debugMode" />
              <div class="form-tip">开启后会在控制台输出调试信息</div>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{ $t('ai.cancel') }}</el-button>
      <el-button @click="resetConfig">重置</el-button>
      <el-button type="primary" @click="confirm" :loading="saving">
        {{ $t('ai.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import {
  getCurrentAIConfig,
  saveLocalAIConfig,
  validateAIConfig,
  getProviderConfig,
  AI_PROVIDERS,
  DEFAULT_AI_CONFIG
} from '@/lib/ai-config.js'
import { updateAIConfig } from '@/lib/ai-service.js'

export default {
  model: {
    prop: 'visible',
    event: 'change'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      aiConfigDialogVisible: false,
      activeCollapse: [],
      saving: false,
      ruleForm: {
        provider: 'openai',
        apiKey: '',
        baseURL: '',
        model: '',
        timeout: 30000,
        debugMode: false
      },
      rules: {
        provider: [
          { required: true, message: '请选择AI提供商', trigger: 'change' }
        ],
        apiKey: [
          {
            validator: (rule, value, callback) => {
              if (this.currentProviderConfig.requiresApiKey && !value) {
                callback(new Error('请输入API Key'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        model: [
          { required: true, message: '请选择模型', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapState(['aiConfig']),
    providerConfigs() {
      const configs = {}
      Object.values(AI_PROVIDERS).forEach(provider => {
        configs[provider] = getProviderConfig(provider)
      })
      return configs
    },
    currentProviderConfig() {
      return getProviderConfig(this.ruleForm.provider)
    }
  },
  watch: {
    visible(val) {
      this.aiConfigDialogVisible = val
      if (val) {
        this.initFormData()
      }
    },
    aiConfigDialogVisible(val, oldVal) {
      if (!val && oldVal) {
        this.close()
      }
    }
  },
  mounted() {
    this.$bus.$on('showAiConfigDialog', this.showDialog)
  },
  beforeDestroy() {
    this.$bus.$off('showAiConfigDialog', this.showDialog)
  },
  methods: {
    ...mapMutations(['setLocalConfig']),

    showDialog() {
      this.aiConfigDialogVisible = true
    },

    close() {
      this.$emit('change', false)
    },

    initFormData() {
      const config = getCurrentAIConfig()
      this.ruleForm = { ...config }
      this.onProviderChange()
    },

    onProviderChange() {
      const config = this.currentProviderConfig
      if (!this.ruleForm.baseURL || this.ruleForm.baseURL === '') {
        this.ruleForm.baseURL = config.baseURL
      }
      if (!this.ruleForm.model || !config.models.includes(this.ruleForm.model)) {
        this.ruleForm.model = config.models[0]
      }
    },

    resetConfig() {
      this.$confirm('确定要重置为默认配置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.ruleForm = { ...DEFAULT_AI_CONFIG }
        this.onProviderChange()
        this.$message.success('已重置为默认配置')
      }).catch(() => {})
    },

    cancel() {
      this.close()
      this.initFormData()
    },

    confirm() {
      this.$refs.ruleFormRef.validate(async (valid) => {
        if (!valid) return

        this.saving = true
        try {
          // 保存AI配置
          const success = saveLocalAIConfig(this.ruleForm)

          if (success) {
            // 更新AI服务配置
            updateAIConfig(this.ruleForm)

            // 同时更新旧的aiConfig格式以保持兼容性
            this.setLocalConfig({
              aiConfig: {
                api: this.ruleForm.baseURL,
                key: this.ruleForm.apiKey,
                model: this.ruleForm.model,
                port: 3456,
                method: 'POST'
              }
            })

            this.$message.success(this.$t('ai.configSaveSuccessTip'))
            this.close()
          } else {
            this.$message.error('配置保存失败')
          }
        } catch (error) {
          console.error('保存配置失败:', error)
          this.$message.error('保存配置失败：' + error.message)
        } finally {
          this.saving = false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.aiConfigDialog {
  /deep/ .el-dialog__body {
    padding: 12px 20px;
  }

  .aiConfigBox {
    a {
      color: #409eff;
    }

    .title {
      margin-bottom: 12px;
      font-weight: bold;
    }

    .desc {
      margin-bottom: 12px;
      padding-left: 12px;
      border-left: 5px solid #ccc;
    }

    .form-tip {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
      line-height: 1.4;
    }

    /deep/ .el-collapse {
      border: none;

      .el-collapse-item__header {
        background: #f8f9fa;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        padding: 0 12px;
        font-size: 14px;
      }

      .el-collapse-item__content {
        padding: 16px 0 0 0;
      }

      .el-collapse-item__wrap {
        border: none;
      }
    }

    /deep/ .el-input-number {
      .el-input__inner {
        text-align: left;
      }
    }
  }
}
</style>
