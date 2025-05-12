"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Settings,
  Check,
  AlertCircle,
  Sparkles,
  ChevronDown,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Define o schema para validação do formulário de template
const notificationTemplateSchema = z.object({
  enabled: z.boolean(),
  template: z
    .string()
    .min(1, {
      message: "O template é obrigatório quando as notificações estão ativadas",
    })
    .max(1000, {
      message: "O template não pode ter mais de 1000 caracteres",
    }),
  testPhoneNumber: z.string().optional().nullable(),
});

type NotificationTemplateFormValues = z.infer<
  typeof notificationTemplateSchema
>;

interface NotificationTemplateEditorProps {
  columnId: string;
  columnTitle: string;
  boardTitle: string;
  trigger?: React.ReactNode;
}

export function NotificationTemplateEditor({
  columnId,
  columnTitle,
  boardTitle,
  trigger,
}: NotificationTemplateEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [showAIImprovement, setShowAIImprovement] = useState(false);
  const [improvedTemplate, setImprovedTemplate] = useState<string | null>(null);
  const [isImprovingTemplate, setIsImprovingTemplate] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<string>("criativo");

  const queryClient = useQueryClient();

  // Usando Tanstack Query para buscar o template
  const { data: templateData, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ["notificationTemplate", columnId],
    queryFn: async () => {
      const response = await fetch(
        `/api/notification-templates?columnId=${columnId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch template");
      }
      return response.json();
    },
    enabled: isOpen, // Só busca quando o modal estiver aberto
  });

  // Mutation para salvar o template
  const { mutate: saveTemplate, isPending: isSaving } = useMutation({
    mutationFn: async (data: {
      columnId: string;
      enabled: boolean;
      template: string;
    }) => {
      const response = await fetch("/api/notification-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save template");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Template de notificação salvo com sucesso!");
      setIsOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["notificationTemplate", columnId],
      });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar template: ${error.message}`);
    },
  });

  // Inicializar o formulário com react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<NotificationTemplateFormValues>({
    resolver: zodResolver(notificationTemplateSchema),
    defaultValues: {
      enabled: false,
      template: getDefaultTemplate(),
      testPhoneNumber: "",
    },
  });

  // Observar o valor do campo enabled para validação condicional
  const enabled = watch("enabled");
  const template = watch("template");
  const testPhoneNumber = watch("testPhoneNumber");

  // Carregar o template da coluna quando o componente for montado
  /* Removido o useEffect antigo que carregava o template, pois agora estamos
     usando o Tanstack Query para isso, o que garante uma melhor persistência do estado */

  // Atualizar o formulário quando os dados forem carregados
  useEffect(() => {
    if (templateData && templateData.template) {
      // Definir os valores do formulário
      setValue("enabled", templateData.template.enabled);
      setValue("template", templateData.template.template);
    } else if (!isLoadingTemplate) {
      // Se não houver template, definir os valores padrão
      const defaultTemplate = getDefaultTemplate();
      setValue("enabled", false);
      setValue("template", defaultTemplate);
    }
  }, [templateData, isLoadingTemplate, setValue]);

  // Função para obter um template padrão
  function getDefaultTemplate() {
    return `Olá {{contact_name}}! 

O cartão "{{card_title}}" foi movido para a coluna *{{column_title}}* no quadro *{{board_title}}*.

Detalhes do cartão:
• Título: {{card_title}}
• Descrição: {{card_description}}
• Prioridade: {{card_priority}}
• Data de vencimento: {{card_due_date}}

Data: {{date}}
Hora: {{time}}`;
  }

  // Função para enviar o formulário e salvar o template
  const onSubmit = async (data: NotificationTemplateFormValues) => {
    // Usar a mutation em vez de chamar a API diretamente
    saveTemplate({
      columnId,
      enabled: data.enabled,
      template: data.template,
    });
  };

  // Função para enviar uma mensagem de teste
  const handleSendTest = async () => {
    if (!testPhoneNumber || !template) {
      toast.error(
        "Número de telefone e template são obrigatórios para enviar uma mensagem de teste"
      );
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: testPhoneNumber,
          template,
          variables: {
            board_title: boardTitle,
            column_title: columnTitle,
            card_title: "Exemplo de Cartão",
            card_description:
              "Esta é uma mensagem de teste para verificar a integração com o WhatsApp",
            card_priority: "Alta",
            card_due_date: "31/05/2025",
            contact_name: "Fulano da Silva",
            user_name: "Usuário",
            date: new Date().toLocaleDateString("pt-BR"),
            time: new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTestResult({
          success: true,
          message: "Mensagem de teste enviada com sucesso!",
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || "Erro ao enviar mensagem de teste",
        });
      }
    } catch (error: unknown) {
      let errorMessage = "Erro ao enviar mensagem de teste";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setTestResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para melhorar o template usando IA através da API
  const handleImproveTemplate = async (style: string) => {
    if (!template) {
      toast.error("O template não pode estar vazio para ser aprimorado");
      return;
    }

    setIsImprovingTemplate(true);
    setShowAIImprovement(true);
    setCurrentStyle(style);

    try {
      const response = await fetch("/api/ai/improve-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template,
          style,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao aprimorar o template");
      }

      setImprovedTemplate(data.improvedTemplate);
      toast.success(`Template aprimorado com estilo ${style}`);
    } catch (error) {
      console.error("Erro ao aprimorar template:", error);
      toast.error(
        "Não foi possível aprimorar o template. Tente novamente mais tarde."
      );
      setShowAIImprovement(false);
    } finally {
      setIsImprovingTemplate(false);
    }
  };

  // Função para usar o template aprimorado
  const handleUseImprovedTemplate = () => {
    if (improvedTemplate) {
      setValue("template", improvedTemplate);
      setShowAIImprovement(false);
      setImprovedTemplate(null);
      toast.success("Template aprimorado aplicado com sucesso!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configurar Notificações
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-[90vw] w-full lg:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Configurar Notificações para Coluna: {columnTitle}
          </DialogTitle>
          <DialogDescription>
            Configure o template de mensagem que será enviado via WhatsApp
            quando um cartão for movido para esta coluna.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled" className="text-base">
              Ativar notificações para esta coluna
            </Label>
            <Switch
              id="enabled"
              {...register("enabled")}
              disabled={isLoadingTemplate || isSaving}
              checked={watch("enabled")}
              onCheckedChange={(checked) => setValue("enabled", checked)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="template">Template da Mensagem</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading || isImprovingTemplate}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Aprimore com IA
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleImproveTemplate("formal")}
                  >
                    Estilo Formal
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleImproveTemplate("descontraido")}
                  >
                    Estilo Descontraído
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleImproveTemplate("conciso")}
                  >
                    Estilo Conciso
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleImproveTemplate("criativo")}
                  >
                    Estilo Criativo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {showAIImprovement && improvedTemplate ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Template Original
                    </Label>
                    <div className="p-3 border rounded-md bg-muted/30 text-sm font-mono whitespace-pre-wrap">
                      {template}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Template Aprimorado
                    </Label>
                    <div className="p-3 border rounded-md bg-muted/30 text-sm font-mono whitespace-pre-wrap">
                      {improvedTemplate}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIImprovement(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Fechar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleUseImprovedTemplate}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Usar este
                  </Button>
                </div>
              </div>
            ) : isImprovingTemplate ? (
              <div className="mt-4 p-3 border rounded-md flex items-center justify-center h-32">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span className="text-sm text-muted-foreground">
                    Aprimorando template com IA...
                  </span>
                </div>
              </div>
            ) : null}
            <Textarea
              id="template"
              {...register("template")}
              rows={10}
              className="font-mono text-sm"
              placeholder="Digite o template da mensagem..."
              disabled={isLoading || isImprovingTemplate}
            />
            {errors.template && (
              <p className="text-destructive text-sm mt-1">
                {errors.template.message}
              </p>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mt-2">Variáveis disponíveis:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>
                  <code className="bg-muted px-1 rounded">
                    {"{{board_title}}"}
                  </code>{" "}
                  - Título do quadro
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">
                    {"{{column_title}}"}
                  </code>{" "}
                  - Título da coluna
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">
                    {"{{card_title}}"}
                  </code>{" "}
                  - Título do cartão
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">
                    {"{{card_description}}"}
                  </code>{" "}
                  - Descrição do cartão
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">
                    {"{{contact_name}}"}
                  </code>{" "}
                  - Nome do contato associado ao cartão
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">
                    {"{{card_priority}}"}
                  </code>{" "}
                  - Prioridade do cartão
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">
                    {"{{card_due_date}}"}
                  </code>{" "}
                  - Data de vencimento
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">{"{{date}}"}</code> -
                  Data atual
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">{"{{time}}"}</code> -
                  Hora atual
                </li>
              </ul>
            </div>
          </div>

          {enabled && (
            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">Enviar mensagem de teste</h3>
              <div className="space-y-2">
                <Label htmlFor="testPhone">Número de telefone para teste</Label>
                <Input
                  id="testPhone"
                  {...register("testPhoneNumber")}
                  placeholder="Ex: +5511999998888"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleSendTest}
                disabled={isLoading || !testPhoneNumber}
                className="w-full"
              >
                Enviar Mensagem de Teste
              </Button>

              {testResult && (
                <div
                  className={cn(
                    "p-3 rounded-md text-sm flex items-start",
                    testResult.success
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  )}
                >
                  {testResult.success ? (
                    <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  )}
                  <p>{testResult.message}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
