"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContacts, Contact, ContactFormValues } from "@/hooks/use-contacts";

// Define o schema para validação do formulário de contatos
const contactSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }).max(100, {
    message: "O nome não pode ter mais de 100 caracteres",
  }),
  phoneNumber: z
    .string()
    .min(1, { message: "O telefone é obrigatório" })
    .max(30, { message: "O telefone não pode ter mais de 30 caracteres" })
    .refine((val) => /^\+\d+/.test(val), {
      message: "O telefone deve começar com um código de país (+)",
    })
    .refine(
      (val) => {
        // Count only digits, ignoring formatting characters
        const digitsOnly = val.replace(/[^\d+]/g, "");
        // Calculate minimum expected length based on country code
        let minLength = 10; // Default minimum length including country code

        // Adjust minimum length based on common country codes
        if (val.startsWith("+1")) minLength = 11; // US/Canada: +1 + 10 digits
        else if (val.startsWith("+44")) minLength = 12; // UK: +44 + 10 digits
        else if (val.startsWith("+33"))
          minLength = 11; // France: +33 + 9 digits
        else if (val.startsWith("+49"))
          minLength = 12; // Germany: +49 + 10/11 digits
        else if (val.startsWith("+55"))
          minLength = 13; // Brazil: +55 + 11 digits
        else if (val.startsWith("+")) minLength = 8; // Generic international

        return digitsOnly.length >= minLength;
      },
      {
        message: "O número não tem dígitos suficientes para o país selecionado",
      }
    )
    .refine(
      (val) => {
        // Remove all formatting characters for validation
        const digitsOnly = val.replace(/[^0-9+]/g, "");

        // Check if the phone number follows WhatsApp's general format requirements
        // This is a basic validation that the number has a valid structure
        return /^\+[1-9]\d{1,14}$/.test(digitsOnly);
      },
      {
        message: "O formato do número não é válido para WhatsApp",
      }
    ),
});

// Lista de países com códigos telefônicos
const countries = [
  { code: "BR", name: "Brasil", phoneCode: "+55", mask: "+55 (99) 99999-9999" },
  {
    code: "US",
    name: "Estados Unidos",
    phoneCode: "+1",
    mask: "+1 (999) 999-9999",
  },
  { code: "PT", name: "Portugal", phoneCode: "+351", mask: "+351 999 999 999" },
  { code: "ES", name: "Espanha", phoneCode: "+34", mask: "+34 999 999 999" },
  { code: "FR", name: "França", phoneCode: "+33 9 99 99 99 99" },
  { code: "DE", name: "Alemanha", phoneCode: "+49", mask: "+49 999 9999999" },
  { code: "IT", name: "Itália", phoneCode: "+39", mask: "+39 999 999 9999" },
  {
    code: "UK",
    name: "Reino Unido",
    phoneCode: "+44",
    mask: "+44 9999 999999",
  },
  { code: "MX", name: "México", phoneCode: "+52", mask: "+52 999 999 9999" },
  {
    code: "AR",
    name: "Argentina",
    phoneCode: "+54",
    mask: "+54 9 99 9999-9999",
  },
  { code: "CL", name: "Chile", phoneCode: "+56", mask: "+56 9 9999 9999" },
  { code: "CO", name: "Colômbia", phoneCode: "+57", mask: "+57 999 9999999" },
  { code: "PE", name: "Peru", phoneCode: "+51", mask: "+51 999 999 999" },
];

interface ContactManagerProps {
  selectedContact?: Contact | null;
  onSelectContact?: (contact: Contact | null) => void;
  allowClear?: boolean;
  trigger?: React.ReactNode;
}

export function ContactManager({
  selectedContact,
  onSelectContact,
  allowClear = true,
  trigger,
}: ContactManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("BR");
  const [phoneNumberValue, setPhoneNumberValue] = useState("");

  // Use the contacts hook
  const {
    contacts,
    isLoading,
    createContact,
    updateContact,
    deleteContact,
    isCreating,
    isUpdating,
    isDeleting,
  } = useContacts();

  // Inicializar o formulário com react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
    },
  });

  // Função para formatar o número de telefone baseado no país
  const formatPhoneNumber = (input: string, country: string) => {
    // Remove all non-numeric characters except the plus sign at the beginning
    const cleaned = input.replace(/[^\d+]/g, "");
    const countryData = countries.find((c) => c.code === country);

    if (!countryData) return input; // Fallback if country not found

    const phoneCode =
      countryData.phoneCode.replace(/\s+/g, "").replace(/^\+/, "") || "";

    // If the input is empty or just a plus sign, return empty or just the plus
    if (!cleaned || cleaned === "+") return cleaned;

    // Add the plus sign and country code if it doesn't exist
    let formatted = "";

    if (cleaned.startsWith("+")) {
      // Check if the country code after the plus matches the selected country
      if (cleaned.startsWith("+" + phoneCode)) {
        // Country code matches selected country
        formatted = cleaned;
      } else {
        // Country code doesn't match - extract the number part and prepend selected country code
        const existingCodeMatch = countries.find((c) =>
          cleaned.startsWith(
            "+" + c.phoneCode.replace(/\s+/g, "").replace(/^\+/, "")
          )
        );
        if (existingCodeMatch) {
          // Extract the phone number without the existing country code
          const numberPart = cleaned.substring(
            (
              "+" +
              existingCodeMatch.phoneCode.replace(/\s+/g, "").replace(/^\+/, "")
            ).length
          );
          // Add the selected country code
          formatted = "+" + phoneCode + numberPart;
        } else {
          // No recognizable country code, treat the whole number as local and add selected country code
          formatted = "+" + phoneCode + cleaned.substring(1);
        }
      }
    } else if (cleaned.startsWith(phoneCode)) {
      // If already has country code without plus, add plus
      formatted = "+" + cleaned;
    } else {
      // Add country code with plus
      formatted = "+" + phoneCode + cleaned;
    }

    // Extract the numbers after the country code for pattern matching
    const countryCodeWithPlus = "+" + phoneCode;
    const numbersAfterCode = formatted.startsWith(countryCodeWithPlus)
      ? formatted.substring(countryCodeWithPlus.length)
      : formatted;

    // Format based on country
    switch (country) {
      case "BR":
        // Brazil: +55 (XX) XXXXX-XXXX
        if (formatted.length <= 3) {
          return formatted;
        } else if (formatted.length <= 5) {
          return `${formatted.slice(0, 3)} (${formatted.slice(3)}`;
        } else if (formatted.length <= 7) {
          return `${formatted.slice(0, 3)} (${formatted.slice(
            3,
            5
          )}) ${formatted.slice(5)}`;
        } else if (formatted.length <= 12) {
          return `${formatted.slice(0, 3)} (${formatted.slice(
            3,
            5
          )}) ${formatted.slice(5)}`;
        } else {
          return `${formatted.slice(0, 3)} (${formatted.slice(
            3,
            5
          )}) ${formatted.slice(5, 10)}-${formatted.slice(10, 14)}`;
        }
      case "US":
        // US: +1 (XXX) XXX-XXXX
        if (formatted.length <= 2) {
          return formatted;
        } else if (formatted.length <= 5) {
          return `${formatted.slice(0, 2)} (${formatted.slice(2)}`;
        } else if (formatted.length <= 8) {
          return `${formatted.slice(0, 2)} (${formatted.slice(
            2,
            5
          )}) ${formatted.slice(5)}`;
        } else {
          return `${formatted.slice(0, 2)} (${formatted.slice(
            2,
            5
          )}) ${formatted.slice(5, 8)}-${formatted.slice(8, 12)}`;
        }
      default:
        // Apply format based on country mask
        if (countryData?.mask) {
          let result = countryCodeWithPlus;
          const digits = numbersAfterCode.replace(/\D/g, "");
          let digitIndex = 0;

          // Apply mask after the country code
          for (
            let i = countryCodeWithPlus.length;
            i < countryData.mask.length && digitIndex < digits.length;
            i++
          ) {
            if (countryData.mask[i] === "9") {
              // Add the next digit
              result += digits[digitIndex++];
            } else {
              // Add the formatting character
              result += countryData.mask[i];
            }
          }

          // Add any remaining digits
          if (digitIndex < digits.length) {
            result += " " + digits.slice(digitIndex);
          }

          return result;
        } else {
          // Generic international format: +XXX XX XXXX XXXX
          if (formatted.length <= 4) {
            return formatted;
          } else if (formatted.length <= 6) {
            return `${formatted.slice(0, 4)} ${formatted.slice(4)}`;
          } else if (formatted.length <= 10) {
            return `${formatted.slice(0, 4)} ${formatted.slice(
              4,
              6
            )} ${formatted.slice(6)}`;
          } else {
            return `${formatted.slice(0, 4)} ${formatted.slice(
              4,
              6
            )} ${formatted.slice(6, 10)} ${formatted.slice(10)}`;
          }
        }
    }
  };

  // Carregar dados do contato que está sendo editado
  useEffect(() => {
    if (editingContact) {
      setValue("name", editingContact.name);
      setValue("phoneNumber", editingContact.phoneNumber);

      // Identificar o país com base no número
      const countryCode =
        countries.find((c) =>
          editingContact.phoneNumber.startsWith(c.phoneCode)
        )?.code || "BR";

      setSelectedCountry(countryCode);
      setPhoneNumberValue(editingContact.phoneNumber);
    } else {
      reset();
      setPhoneNumberValue("");
      setSelectedCountry("BR");
    }
  }, [editingContact, setValue, reset]);

  // Atualizar o número de telefone quando o país mudar
  useEffect(() => {
    if (phoneNumberValue) {
      // Extrair apenas os dígitos do número atual (sem formatação)
      const digitsOnly = phoneNumberValue.replace(/[^\d+]/g, "");

      // Remover o código do país anterior, se existir
      let withoutCountryCode = digitsOnly;
      const plusIndex = digitsOnly.indexOf("+");

      if (plusIndex !== -1) {
        // Encontrar o primeiro espaço após o código do país ou usar um índice padrão
        const spaceIndex = digitsOnly.indexOf(" ", plusIndex);
        if (spaceIndex !== -1) {
          withoutCountryCode = digitsOnly.substring(spaceIndex + 1);
        } else {
          // Se não houver espaço, remover os primeiros caracteres (código aproximado)
          const country = countries.find((c) =>
            digitsOnly.startsWith(c.phoneCode)
          );
          if (country) {
            withoutCountryCode = digitsOnly.substring(country.phoneCode.length);
          } else {
            // Tenta remover +XX assumindo que é um código de país
            withoutCountryCode =
              plusIndex === 0 ? digitsOnly.substring(3) : digitsOnly;
          }
        }
      }

      // Obter o código do novo país selecionado
      const country = countries.find((c) => c.code === selectedCountry);
      if (!country) return;

      // Aplicar o novo código do país e formatar
      const newPhoneNumber =
        country.phoneCode +
        (withoutCountryCode ? " " + withoutCountryCode : "");
      const formattedNumber = formatPhoneNumber(
        newPhoneNumber,
        selectedCountry
      );

      setPhoneNumberValue(formattedNumber);
      setValue("phoneNumber", formattedNumber);
    }
  }, [selectedCountry, setValue, phoneNumberValue]);

  // Função para enviar o formulário e salvar o contato
  const onSubmit = async (data: ContactFormValues) => {
    if (editingContact) {
      updateContact({
        id: editingContact.id,
        ...data,
      });
    } else {
      createContact(data);
    }

    setIsFormOpen(false);
    setEditingContact(null);
  };

  // Função para excluir um contato
  const handleDeleteContact = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este contato?")) {
      deleteContact(id);

      if (selectedContact?.id === id && onSelectContact) {
        onSelectContact(null);
      }
    }
  };

  // Função para lidar com a seleção de um contato na lista
  const handleSelectContact = (contact: Contact) => {
    if (onSelectContact) {
      onSelectContact(contact);
      setIsOpen(false);
    }
  };

  // Lidar com a mudança no campo de telefone
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhoneNumber = formatPhoneNumber(
      e.target.value,
      selectedCountry
    );
    setPhoneNumberValue(formattedPhoneNumber);
    setValue("phoneNumber", formattedPhoneNumber);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" className="w-full justify-start">
              {selectedContact ? (
                <div className="flex items-center text-left">
                  <Phone className="mr-2 h-4 w-4" />
                  <div className="flex gap-4 items-center truncate">
                    <div className="font-medium max-w-56 truncate">
                      {selectedContact.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {selectedContact.phoneNumber}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Selecionar contato...
                </span>
              )}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Contatos</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingContact(null);
                setIsFormOpen(true);
                reset();
                setPhoneNumberValue("");
                setSelectedCountry("BR");
                setValue("phoneNumber", "");
                setValue("name", "");
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Novo Contato
            </Button>
          </div>

          {/* Lista de contatos */}
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-4">Carregando contatos...</div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum contato encontrado
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-secondary group"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleSelectContact(contact)}
                  >
                    <div className="font-medium">{contact.name}</div>
                    <div className="my-2 text-sm text-muted-foreground">
                      {contact.phoneNumber}
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingContact(contact);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteContact(contact.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedContact && allowClear && (
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onSelectContact) {
                    onSelectContact(null);
                    setIsOpen(false);
                  }
                }}
              >
                Limpar Seleção
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de formulário de contato */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Editar Contato" : "Novo Contato"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome completo"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Telefone (WhatsApp)</Label>
                <div className="flex space-x-2">
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="País" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name} ({country.phoneCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phoneNumber"
                    placeholder={
                      countries.find((c) => c.code === selectedCountry)?.mask ||
                      "+XX XXXX XXXX"
                    }
                    value={phoneNumberValue}
                    onChange={handlePhoneNumberChange}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingContact(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {editingContact ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
