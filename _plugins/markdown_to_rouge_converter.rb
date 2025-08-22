# frozen_string_literal: true

# Convert markdown code block syntax with line highlighting to Rouge highlight tags

Jekyll::Hooks.register :documents, :pre_render do |document, payload|
  docExt = document.extname.tr('.', '')

  # only process if we deal with a markdown file
  if payload['site']['markdown_ext'].include? docExt
    # Convert ```language{line numbers} to {% highlight language mark_lines="line numbers" %}
    document.content.gsub!(/^```([a-zA-Z]+)\{([0-9\s]+)\}$(.*?)^```$/m) do |match|
      language = $1
      line_numbers = $2.strip
      code_content = $3

      "{% highlight #{language} mark_lines=\"#{line_numbers}\" %}#{code_content}{% endhighlight %}"
    end
  end
end
