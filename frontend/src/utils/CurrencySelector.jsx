import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import ReactCountryFlag from "react-country-flag";

const CurrencySelector = ({ value, onChange, currencies }) => {
  const fiatFlags = {
    VES: "VE",
    COP: "CO",
    CLP: "CL",
    MXN: "MX",
    PEN: "PE",
    ARS: "AR",
    USD: "US",
    UYU: "UY",
    BRL: "BR",
    EUR: "EU",
    PAN: "PA",
    ECU: "EC",
  };

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-40">
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-transparent py-2 pl-3 pr-10 text-left text-xl font-bold text-white  focus:outline-none focus:ring-2 focus:ring-cyan-400">
          <span className="truncate flex items-center gap-3">
            <ReactCountryFlag
              countryCode={fiatFlags[value]}
              svg
              className="text-2xl"
            />
            {value}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-cyan-300">
            <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-y-auto hide-scrollbar rounded-lg bg-slate-900/90 shadow-lg ring-1 ring-cyan-400/30 focus:outline-none z-10">
            {currencies.map((c) => (
              <Listbox.Option
                key={c.fiat}
                value={c.fiat}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? "bg-cyan-600 text-white" : "text-cyan-200"
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <div
                      className={`flex items-center gap-3 truncate ${
                        selected ? "font-bold" : "font-normal"
                      }`}
                    >
                      <ReactCountryFlag
                        countryCode={fiatFlags[c.fiat]}
                        svg
                        className="text-xl"
                      />
                      <span>{c.fiat}</span>
                    </div>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-300">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};
export default CurrencySelector;
