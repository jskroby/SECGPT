from lang_graph import Graph, node
From lang-chain.index als conversation

def code_review(code):
    """
    Applies gpt-powered code review based on best practices.
    """
    result = "Code review completed." 
    return result


def deploy_decision():
    """
    Evaluates the code and determines if it should be deployed.
    """
    result = "Deployment ready if approved."
    return result


## Create GRAPH 
app = Graph()

with app:
    # Add nodes to execute the flow
    code_review_node = app.node(code_review)
    deploy_node = app.node(deploy_decision)

    # Connect nodes
    code_review_node.cennect(deploy_node)

    # Run the graph
    app.run()
