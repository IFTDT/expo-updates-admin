"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { AppLayout } from "@/components/app-layout"
import { API_CONFIG, versionsApi } from "@/lib/api"
import { Upload, X, FileUp } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

interface NewVersionPageProps {
  params: Promise<{ appId: string }>
}

export default function NewVersionPage({ params }: NewVersionPageProps) {
  const router = useRouter()
  const [appId, setAppId] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"upload" | "byUrl">("upload")

  const resolveFileUrl = (url: string) => {
    if (!url) {
      return url
    }

    if (/^https?:\/\//i.test(url)) {
      return url
    }

    const baseURL = API_CONFIG.baseURL.replace(/\/+$/, "")
    const normalizedPath = url.startsWith("/") ? url : `/${url}`

    console.log(`${baseURL}${normalizedPath}`)
    return `${baseURL}${normalizedPath}`
  }

  // 初始化 appId
  useEffect(() => {
    params.then((p) => setAppId(p.appId))
  }, [params])

  const [formData, setFormData] = useState({
    version: "",
    build: "",
    name: "",
    description: "",
    runtimeVersion: "",
    isMandatory: "false",
    publishTime: "now",
    scheduledDate: "",
    scheduledTime: "",
    fileUrl: "",
    fileSize: "",
    checksum: "",
  })

  useEffect(() => {
    if (mode === "byUrl") {
      setFile(null)
      setUploadProgress(0)
    } else {
      setFormData((prev) => ({
        ...prev,
        fileUrl: "",
        fileSize: "",
        checksum: "",
      }))
    }
  }, [mode])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const lowerCaseName = selectedFile.name.toLowerCase()
      // 验证文件格式
      const validExtensions = [".tar.gz", ".zip", ".tgz"]

      if (!validExtensions.some((ext) => lowerCaseName.endsWith(ext))) {
        setError("不支持的文件格式，请上传 .tar.gz、.zip 或 .tgz 文件")
        return
      }

      // 验证文件大小 (100MB)
      const maxSize = 100 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        setError("文件大小不能超过 100MB")
        return
      }

      setFile(selectedFile)
      setError("")
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setUploadProgress(0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const fakeEvent = {
        target: { files: [droppedFile] },
      } as any
      handleFileChange(fakeEvent)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.version.trim()) {
      setError("请填写版本号")
      return
    }

    if (!formData.build.trim()) {
      setError("请填写构建版本")
      return
    }

    if (!formData.name.trim()) {
      setError("请填写版本名称")
      return
    }

    if (
      formData.publishTime === "scheduled" &&
      (!formData.scheduledDate || !formData.scheduledTime)
    ) {
      setError("请选择定时发布的日期和时间")
      return
    }

    if (mode === "upload") {
      if (!file) {
        setError("请上传更新包文件")
        return
      }

      if (!formData.runtimeVersion.trim()) {
        setError("请填写运行时版本 (Runtime Version)")
        return
      }
    } else {
      if (!formData.fileUrl.trim()) {
        setError("请填写文件地址")
        return
      }

      const parsedSize = Number(formData.fileSize)
      if (!formData.fileSize.trim() || Number.isNaN(parsedSize) || parsedSize <= 0) {
        setError("请填写正确的文件大小（字节数）")
        return
      }

      if (!formData.checksum.trim()) {
        setError("请填写文件校验值")
        return
      }
    }

    setShowConfirm(true)
  }

  const handleConfirmPublish = async () => {
    if (!appId) {
      setError("缺少必要信息")
      return
    }

    if (mode === "upload" && !file) {
      setError("请上传更新包文件")
      return
    }

    setShowConfirm(false)
    setIsUploading(true)
    setError("")
    setUploadProgress(0)

    try {
      let scheduledAt: string | undefined
      if (formData.publishTime === "scheduled" && formData.scheduledDate && formData.scheduledTime) {
        const dateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
        if (Number.isNaN(dateTime.getTime())) {
          setError("定时发布时间格式不正确")
          setIsUploading(false)
          return
        }
        scheduledAt = dateTime.toISOString()
      }

      let createResponse

      if (mode === "upload" && file) {
        const createPayload = {
          version: formData.version.trim(),
          build: formData.build.trim(),
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          runtimeVersion: formData.runtimeVersion.trim(),
          isMandatory: formData.isMandatory === "true",
          publishTime: formData.publishTime as "now" | "scheduled",
          scheduledAt,
        }

        setUploadProgress(25)
        createResponse = await versionsApi.createVersionWithFile(appId, file, createPayload)
      } else {
        const createVersionData = {
          version: formData.version.trim(),
          build: formData.build.trim(),
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          runtimeVersion: formData.runtimeVersion.trim() || undefined,
          isMandatory: formData.isMandatory === "true",
          fileUrl: resolveFileUrl(formData.fileUrl.trim()),
          fileSize: Number(formData.fileSize),
          checksum: formData.checksum.trim(),
          publishTime: formData.publishTime as "now" | "scheduled",
          scheduledAt,
        }

        createResponse = await versionsApi.createVersionByUrl(appId, createVersionData)
      }

      if (!createResponse.success) {
        setError(createResponse.error?.message || "创建版本失败")
        setIsUploading(false)
        return
      }

      setUploadProgress(100)

      setTimeout(() => {
        setIsUploading(false)
        router.push(`/apps/${appId}/versions`)
      }, 500)
    } catch (err) {
      setError("发布更新失败，请稍后重试")
      console.error("发布更新错误:", err)
      setIsUploading(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">发布新更新</h1>
              <p className="text-muted-foreground mt-1">
                上传更新包并配置版本信息
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 左侧：文件上传 */}
            <Card>
              <CardHeader>
                <CardTitle>更新包来源</CardTitle>
                <CardDescription>选择上传文件或填写文件地址</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={mode} onValueChange={(value) => setMode(value as "upload" | "byUrl")}>
                  <TabsList>
                    <TabsTrigger value="upload">上传文件</TabsTrigger>
                    <TabsTrigger value="byUrl">文件地址</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-4 space-y-4">
                    {!file ? (
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors hover:border-primary"
                      >
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".tar.gz,.zip,.tgz"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <FileUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                          <p className="mb-2 text-sm font-medium">点击或拖拽文件到此处上传</p>
                          <p className="text-xs text-muted-foreground">
                            支持 .tar.gz、.zip、.tgz 格式，最大 100MB
                          </p>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <FileUp className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                            disabled={isUploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {isUploading && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>上传中...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                              <div
                                className="h-2 rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="byUrl" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fileUrl">文件地址 *</Label>
                      <Input
                        id="fileUrl"
                        placeholder="https://example.com/updates/app-update.tar.gz"
                        value={formData.fileUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fileUrl: e.target.value,
                          })
                        }
                        disabled={isUploading}
                      />
                      <p className="text-xs text-muted-foreground">
                        支持 HTTP/HTTPS 链接，可填写相对路径
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fileSize">文件大小 (字节) *</Label>
                      <Input
                        id="fileSize"
                        type="number"
                        min="1"
                        placeholder="例如：10485760"
                        value={formData.fileSize}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fileSize: e.target.value,
                          })
                        }
                        disabled={isUploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checksum">文件校验值 *</Label>
                      <Input
                        id="checksum"
                        placeholder="请输入文件的校验值（如 SHA256）"
                        value={formData.checksum}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            checksum: e.target.value,
                          })
                        }
                        disabled={isUploading}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* 右侧：版本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>版本信息</CardTitle>
                <CardDescription>填写版本号和更新说明</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="version">版本号 *</Label>
                  <Input
                    id="version"
                    placeholder="例如: 1.2.0"
                    value={formData.version}
                    onChange={(e) =>
                      setFormData({ ...formData, version: e.target.value })
                    }
                    required
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="build">构建版本 *</Label>
                  <Input
                    id="build"
                    placeholder="例如: 123"
                    value={formData.build}
                    onChange={(e) =>
                      setFormData({ ...formData, build: e.target.value })
                    }
                    required
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    应用的构建版本号，用于标识不同的构建
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="runtimeVersion">
                    运行时版本 (Runtime Version{mode === "upload" ? " *" : ""})
                  </Label>
                  <Input
                    id="runtimeVersion"
                    placeholder="例如: 1.0.0"
                    value={formData.runtimeVersion}
                    onChange={(e) =>
                      setFormData({ ...formData, runtimeVersion: e.target.value })
                    }
                    required={mode === "upload"}
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Expo Updates 要求的运行时版本，用于匹配兼容的更新包
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">版本名称 *</Label>
                  <Input
                    id="name"
                    placeholder="例如: 功能优化版本"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">更新说明</Label>
                  <Textarea
                    id="description"
                    placeholder="描述本次更新的内容和改进..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    disabled={isUploading}
                  />
                </div>


                {formData.publishTime === "scheduled" && (
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">日期</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduledDate: e.target.value,
                          })
                        }
                        disabled={isUploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime">时间</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduledTime: e.target.value,
                          })
                        }
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href={`/apps/${appId}/versions`}>
              <Button type="button" variant="outline" disabled={isUploading}>
                取消
              </Button>
            </Link>
            <Button type="submit" disabled={isUploading || (mode === "upload" && !file)}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "发布中..." : "发布更新"}
            </Button>
          </div>
        </form>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认发布更新</AlertDialogTitle>
            <AlertDialogDescription>
              确定要发布版本 <strong>{formData.version}</strong> 吗？
              <br />
              构建版本: <strong>{formData.build || "未填写"}</strong>
              <br />
              运行时版本: <strong>{formData.runtimeVersion || "未填写"}</strong>
              <br />
              此操作会将更新推送给所有用户。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPublish}>
              确认发布
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}

