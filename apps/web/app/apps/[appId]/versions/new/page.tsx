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
import {
  Upload,
  X,
  FileUp,
  Check,
} from "lucide-react"
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

  // 初始化 appId
  useEffect(() => {
    params.then((p) => setAppId(p.appId))
  }, [params])

  const [formData, setFormData] = useState({
    version: "",
    name: "",
    description: "",
    isMandatory: "false",
    publishTime: "now",
    scheduledDate: "",
    scheduledTime: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // 验证文件格式
      const validExtensions = [".tar.gz", ".zip", ".tgz"]
      const fileExtension = selectedFile.name
        .toLowerCase()
        .substring(selectedFile.name.lastIndexOf("."))

      if (!validExtensions.some((ext) => fileExtension.includes(ext))) {
        alert("不支持的文件格式，请上传 .tar.gz、.zip 或 .tgz 文件")
        return
      }

      // 验证文件大小 (100MB)
      const maxSize = 100 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        alert("文件大小不能超过 100MB")
        return
      }

      setFile(selectedFile)
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
    if (!file) {
      alert("请上传更新包文件")
      return
    }
    setShowConfirm(true)
  }

  const handleConfirmPublish = async () => {
    setShowConfirm(false)
    setIsUploading(true)

    // 模拟上传进度
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    // TODO: 实现实际上传逻辑
    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)
      setIsUploading(false)
      // 跳转到版本列表页
      router.push(`/apps/${appId}/versions`)
    }, 3000)
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 左侧：文件上传 */}
            <Card>
              <CardHeader>
                <CardTitle>更新包上传</CardTitle>
                <CardDescription>
                  上传应用的更新包文件（.tar.gz, .zip, .tgz）
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".tar.gz,.zip,.tgz"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm font-medium mb-2">
                        点击或拖拽文件到此处上传
                      </p>
                      <p className="text-xs text-muted-foreground">
                        支持 .tar.gz、.zip、.tgz 格式，最大 100MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
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
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                  />
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isMandatory">更新类型</Label>
                  <Select
                    value={formData.isMandatory}
                    onValueChange={(value) =>
                      setFormData({ ...formData, isMandatory: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">可选更新</SelectItem>
                      <SelectItem value="true">强制更新</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publishTime">发布时间</Label>
                  <Select
                    value={formData.publishTime}
                    onValueChange={(value) =>
                      setFormData({ ...formData, publishTime: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">立即发布</SelectItem>
                      <SelectItem value="scheduled">定时发布</SelectItem>
                    </SelectContent>
                  </Select>
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
              <Button type="button" variant="outline">
                取消
              </Button>
            </Link>
            <Button type="submit" disabled={isUploading}>
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
              确定要发布版本 {formData.version} 吗？此操作会将更新推送给所有用户。
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

