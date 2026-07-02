So here I will define to you the actual flow that I want in this simple project.

The important part is, you will implement what is written in the docs/requirement.md. But you need to follow always the: user-source-of-truth

Basically, this will be deployed in the CloudFlare worker so please have a time to read the astro-js-cloudflare-worker-skill

So our database will be: sample-doc-editor-database
It is a D1 Database.

If you are making a schema, please run the migration on both local and remote. wrangler is already configured if not authenticated please ask the user.

I want you to use npm create astro@latest
But be sure to just use version 6.1.9 since that one is the only thing that works base on my latest project.
for TypeScript just use the version 5.9.3

You can use react but be sure to follow the bullet-proof-react https://github.com/alan2207/bulletproof-react

Please use Tailwindcss as well.
And for icon please use lucide icon.
For Editor, please use toast-ui.
For status, please use toastify
For quick component, please use heavily the shadcn.
Just please make a global customization for shadcn base on our docs/design.md and docs/sample-ui.md
For testing please use the vitest

For jwt or any kind of auth please don't use bcrypt! just web crypto and later on making task list, please include making a helper and put it in /utility or /lib if the helper needs dependency.

All functions that CAN BE ATOMIC must be written in /utility or /lib.

If you are implementing API: Please separate it into routes, controller, service, model.
Though no need for Dependency Injection for this Assessment MVP, just make it routes < controllers < service < model

Finally for the implementation, base on the requirement.md please make the list of Task-list first.
The format will be 
# [ ] Epic [number] [Name]
## [ ] Task Section [number]
Details
### [ ] Task subsection
Details

If you are presenting a details please use ">" to flow it down what to do. and you can use list down per section like
- do this > do this >
- do this > do this >
 
Be sure to start with functionality of the API. 
Then next the UI! 
Then next integration.
Please divide the Epic/task efficiently in actual basis of requirement.md but this one is dived-in including testing.

Please also run it in browser for you to see it clearly.

Also if you are making a flow for documentation, please show the journey of the user using mermaid.
The creation process journey, the viewing process journey, the onboarding journey and the updating/modification journey.

Show also the process flow diagram in a sense of API to UI.

Add what I said to in the task since that is part of the task the documentation.

And as a final note, since it says upload something! please add things you can add like upload (though not everything I will be the one to make a video if you can't just unchecked it okay?)

And the most cherry-on-top prompt: *make no mistakes*

