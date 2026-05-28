import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import { isValidPhoneNumber, parsePhoneNumber, getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import flags from "react-phone-number-input/flags";
import es from "react-phone-number-input/locale/es.json";

interface CountryEntry {
  code: CountryCode;
  name: string;
  dial: string;
}

const COUNTRY_NAMES = es as Record<string, string>;
const countryList: CountryEntry[] = getCountries()
  .filter((code) => COUNTRY_NAMES[code])
  .map((code) => ({
    code: code as CountryCode,
    name: COUNTRY_NAMES[code] || code,
    dial: getCountryCallingCode(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
}

export const PhoneInputField = ({
  value,
  onChange,
  error,
  label = "Teléfono *",
  disabled = false,
}: PhoneInputFieldProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localDigits, setLocalDigits] = useState("");
  const [touched, setTouched] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Track selected country explicitly — NOT derived from parsePhoneNumber
  const getCountry = useCallback((v: string): CountryEntry => {
    if (!v) return countryList.find((c) => c.code === "CO") || countryList[0];
    try {
      const parsed = parsePhoneNumber(v);
      if (parsed?.country) {
        const found = countryList.find((c) => c.code === parsed.country);
        if (found) return found;
      }
    } catch {}
    return countryList.find((c) => c.code === "CO") || countryList[0];
  }, []);

  const [selectedCountry, setSelectedCountry] = useState<CountryEntry>(() => getCountry(value));

  // Do NOT sync selectedCountry from value — handleSelect is the only source of truth
  // The initial value sets the country on mount, after that only explicit user selection changes it

  // Sync local state from value on mount
  useEffect(() => {
    if (value) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed) setLocalDigits(parsed.nationalNumber);
      } catch {
        setLocalDigits(value.replace(/^\+\d+/, ""));
      }
    }
  }, [value]);

  const filtered = useMemo(() => {
    if (!searchQuery) return countryList;
    const q = searchQuery.toLowerCase();
    return countryList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = useCallback(
    (country: CountryEntry) => {
      setSelectedCountry(country);
      setOpen(false);
      setSearchQuery("");
      setLocalDigits("");
      onChange(`+${country.dial}`);
    },
    [onChange]
  );

  const handleDigitsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      setLocalDigits(digits);
      onChange(`+${selectedCountry.dial}${digits}`);
      setTouched(true);
    },
    [selectedCountry.dial, onChange]
  );

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const FlagComponent = selectedCountry.code ? flags[selectedCountry.code] : null;
  const isValid = value ? isValidPhoneNumber(value) : false;
  const showError = touched && (error || (value && !isValid));

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div
        className={cn(
          "flex items-center h-11 w-full rounded-lg border bg-card/50 text-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 overflow-hidden",
          showError ? "border-destructive" : "border-border/50"
        )}
      >
        {/* Country selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "flex items-center gap-1.5 h-full px-2.5 border-r border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors whitespace-nowrap min-w-[78px]",
                open && "bg-muted/40"
              )}
            >
              {FlagComponent ? (
                <FlagComponent className="h-4 w-4 rounded-sm object-cover flex-shrink-0" />
              ) : (
                <span className="h-4 w-4 rounded-sm bg-muted flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                  {selectedCountry.code?.[0]}
                </span>
              )}
              <span className="text-xs font-medium text-muted-foreground">
                +{selectedCountry.dial}
              </span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-muted-foreground/40 flex-shrink-0 transition-transform",
                  open && "rotate-180"
                )}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[300px] p-0"
            align="start"
            sideOffset={6}
          >
            <Command>
              <CommandInput
                ref={searchRef}
                placeholder="Buscar país..."
                value={searchQuery}
                onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
              />
              <CommandList>
                {searchQuery.trim() && filtered.length === 0 && (
                  <CommandEmpty>No se encontraron países</CommandEmpty>
                )}
                <CommandGroup>
                  {filtered.map((country) => {
                    const Flag = flags[country.code];
                    const isSelected = country.code === selectedCountry.code;
                    return (
                      <CommandItem
                        key={country.code}
                        onSelect={() => handleSelect(country)}
                        className={cn(
                          isSelected && "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        <span className="flex items-center gap-2.5 flex-1 min-w-0">
                          {Flag ? (
                            <Flag className="h-5 w-5 rounded-sm object-cover flex-shrink-0" />
                          ) : (
                            <span className="h-5 w-5 rounded-sm bg-muted flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                              {country.code[0]}
                            </span>
                          )}
                          <span className="truncate">{country.name}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-auto">
                            +{country.dial}
                          </span>
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Phone input */}
        <input
          type="tel"
          value={localDigits}
          onChange={handleDigitsChange}
          onBlur={() => setTouched(true)}
          placeholder="Número telefónico"
          disabled={disabled}
          autoComplete="tel-national"
          className="flex-1 h-full px-3 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40 disabled:opacity-50"
        />
      </div>
      {showError && (
        <p className="text-xs text-destructive">
          {error || "Número de teléfono inválido"}
        </p>
      )}
    </div>
  );
};
