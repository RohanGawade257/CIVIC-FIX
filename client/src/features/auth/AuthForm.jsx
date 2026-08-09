function AuthForm({ error, fields, onChange, onSubmit, submitLabel, values }) {
  return (
    <form onSubmit={onSubmit}>
      {fields.map((field) => (
        <p key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          <input
            autoComplete={field.autoComplete}
            id={field.name}
            name={field.name}
            onChange={onChange}
            required
            type={field.type}
            value={values[field.name]}
          />
        </p>
      ))}
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

export default AuthForm;
