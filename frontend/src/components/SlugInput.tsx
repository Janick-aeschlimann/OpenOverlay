import { useEffect, useState } from "react";

export interface ISlugInputProps {
  name: string;
  id: string;
}

const SlugInput: React.FC<ISlugInputProps> = (props) => {
  const [value, setValue] = useState("");

  const nameToSlug = (name: string): string => {
    return name
      .toLowerCase() // convert to lowercase
      .trim() // remove surrounding whitespace
      .normalize("NFD") // normalize to remove accents
      .replace(/[\u0300-\u036f]/g, "") // remove diacritics
      .replace(/[^a-z0-9\s-]/g, "") // remove invalid characters
      .replace(/\s+/g, "-") // replace whitespace with dashes
      .replace(/-+/g, "-"); // collapse multiple dashes
  };

  useEffect(() => {
    if (props.name) {
      setValue(nameToSlug(props.name));
    } else {
      setValue("");
    }
  }, [props.name]);

  return (
    <div
      className={`placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex items-center h-9 w-full min-w-0 rounded-md
        border bg-transparent py-0 text-base shadow-xs transition-[color,box-shadow] outline-none 
        
        aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive`}
    >
      <span className=" pl-3 pr-1 h-full flex items-center border-r-1">
        {location.origin}/
      </span>
      <input
        className="outline-none px-1 h-full w-full rounded-r-md disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        type="text"
        data-slot="input"
        id={props.id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
      />
    </div>
  );
};

export default SlugInput;
